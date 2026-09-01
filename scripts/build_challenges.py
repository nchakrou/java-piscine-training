import os, re, json

tests_dir = '/home/nabil/moraja3a/tests'
readmes_dir = '/home/nabil/moraja3a/readmes'

test_folders = sorted([d for d in os.listdir(tests_dir) if d.endswith('_test')])
print(f'Total test folders: {len(test_folders)}')

def slugify(name):
    # e.g. AreaCalculator_test -> areacalculator
    return re.sub(r'[^a-z0-9]', '', name.lower().replace('_test', ''))

def guess_difficulty(name, readme_content, test_content):
    if any(k in name.lower() for k in ['singleton', 'builder', 'factory', 'decorator', 'observer', 'strategy']):
        return 'Medium'
    if any(k in name.lower() for k in ['circular', 'double', 'stream', 'valid', 'maximal', 'spiral', 'regex', 'html', 'complex', 'sort']):
        return 'Hard'
    if any(k in name.lower() for k in ['hello', 'even', 'count', 'string', 'digit', 'age', 'armstrong', 'cat', 'int', 'float', 'concat', 'replace']):
        return 'Easy'
    if len(test_content) > 3000:
        return 'Hard'
    if len(test_content) > 1500:
        return 'Medium'
    return 'Easy'

def extract_starter_code(readme_content, challenge_name):
    # Match ```java ... ``` under Expected Class
    m = re.search(r'###\s*Expected Class[^\n]*\s*```java(.*?)```', readme_content, re.DOTALL | re.IGNORECASE)
    if m:
        code = m.group(1).strip()
        if len(code) > 10:
            return code
    
    # Or first java code block with public class / interface / enum
    m2 = re.findall(r'```java(.*?)```', readme_content, re.DOTALL)
    for block in m2:
        code = block.strip()
        if ('public class' in code or 'public interface' in code or 'public enum' in code or 'class ' in code) and 'ExerciseRunner' not in code:
            return code
            
    # Default template
    class_name = challenge_name.replace('_test', '')
    return f'public class {class_name} {{\n    // Write your code here\n}}'

def extract_description(readme_content):
    m = re.search(r'###\s*Instructions\s*(.*?)(?=###|\Z)', readme_content, re.DOTALL | re.IGNORECASE)
    if m:
        text = m.group(1).strip()
        lines = [l.strip() for l in text.split('\n') if l.strip() and not l.strip().startswith('#') and not l.strip().startswith('```')]
        if lines:
            cleaned = re.sub(r'[`*_]', '', lines[0])
            return cleaned[:160] + ('...' if len(cleaned) > 160 else '')
    lines = [l.strip() for l in readme_content.split('\n') if l.strip() and not l.strip().startswith('#') and not l.strip().startswith('```')]
    if lines:
        cleaned = re.sub(r'[`*_]', '', lines[0])
        return cleaned[:160] + ('...' if len(cleaned) > 160 else '')
    return 'Implement the requested Java class according to specifications.'

challenges = []
for folder in test_folders:
    raw_name = folder.replace('_test', '')
    slug = slugify(folder)
    
    readme_file = os.path.join(readmes_dir, f'{slug}.md')
    readme_content = ''
    if os.path.exists(readme_file):
        with open(readme_file, 'r', encoding='utf-8', errors='ignore') as f:
            readme_content = f.read()
    else:
        readme_content = f'## {raw_name}\n\n### Instructions\nImplement the `{raw_name}` class passing all required test cases.'
        
    test_file = os.path.join(tests_dir, folder, f'{raw_name}_test.java')
    test_content = ''
    if os.path.exists(test_file):
        with open(test_file, 'r', encoding='utf-8', errors='ignore') as f:
            test_content = f.read()
            
    diff = guess_difficulty(raw_name, readme_content, test_content)
    desc = extract_description(readme_content)
    starter = extract_starter_code(readme_content, raw_name)
    
    # Category tag
    category = 'Algorithms'
    low = raw_name.lower()
    if 'linkedlist' in low or 'array' in low or 'matrix' in low or 'list' in low or 'set' in low or 'map' in low or 'inventory' in low:
        category = 'Data Structures'
    elif 'stream' in low:
        category = 'Streams & Functional'
    elif 'star' in low or 'blueprint' in low or 'singleton' in low or 'factory' in low or 'decorator' in low or 'observer' in low or 'strategy' in low or 'adventure' in low or 'inheritance' in low or 'override' in low:
        category = 'OOP & Design Patterns'
    elif 'date' in low or 'time' in low or 'period' in low:
        category = 'Date & Time'
    elif 'string' in low or 'char' in low or 'palindrome' in low or 'regex' in low or 'html' in low or 'url' in low or 'capitalize' in low or 'strlen' in low:
        category = 'Strings & Parsing'
    elif 'calc' in low or 'math' in low or 'prime' in low or 'factorial' in low or 'armstrong' in low or 'digit' in low or 'fibonacci' in low or 'perfect' in low or 'even' in low or 'operation' in low:
        category = 'Math & Arithmetic'
    elif 'file' in low or 'cat' in low or 'logger' in low:
        category = 'I/O & System'

    # Determine files needed (single or multi-file for tests like Star or Adventure)
    # Check if test folder has extra java files or if student code needs specific filenames
    test_files_in_folder = os.listdir(os.path.join(tests_dir, folder))
    
    challenges.append({
        'id': slug,
        'title': raw_name,
        'testFolder': folder,
        'className': raw_name,
        'testClass': f'{raw_name}Test',
        'difficulty': diff,
        'category': category,
        'description': desc,
        'readme': readme_content,
        'starterCode': starter,
        'totalTests': test_content.count('@Test') if test_content else 1
    })

print(f'Processed {len(challenges)} challenges successfully!')
diff_counts = {}
for c in challenges:
    diff_counts[c['difficulty']] = diff_counts.get(c['difficulty'], 0) + 1
print('Difficulty distribution:', diff_counts)

cat_counts = {}
for c in challenges:
    cat_counts[c['category']] = cat_counts.get(c['category'], 0) + 1
print('Category distribution:', cat_counts)

os.makedirs('/home/nabil/moraja3a/data', exist_ok=True)
with open('/home/nabil/moraja3a/data/challenges.json', 'w', encoding='utf-8') as f:
    json.dump(challenges, f, indent=2)
print('Saved to /home/nabil/moraja3a/data/challenges.json')
