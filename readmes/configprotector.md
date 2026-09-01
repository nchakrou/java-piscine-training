## Config Protector

### Instructions

Create a class named `ConfigProtector` that provides functionality to mask sensitive data in a configuration file using regular expressions (`Regex`). This class should expose a method that replaces sensitive values with asterisks.

The configuration file will be supplied as a `String`, while the sensitive keys will be provided as a `List`.

The format of the configuration file will always follow this structure:

```
username=admin
npassword=secret
...
```

### Expected Class

```java
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ConfigProtector {
    public String hideSensitiveData(String configFile, List<String> sensitiveKeys) {
        // Implementation to hide sensitive data in the configuration file using regex
    }
}
```

### Usage

Here is a possible `ExerciseRunner.java` to test your class:

```java
import java.util.List;
import java.util.Arrays;

public class ExerciseRunner {
    public static void main(String[] args) {
        ConfigProtector protector = new ConfigProtector();

        String configFile1 = "username=admin\npassword=secret\nhost=localhost\n";
        List<String> sensitiveKeys1 = Arrays.asList("password");
        System.out.println("Protected Config 1:\n" + protector.hideSensitiveData(configFile1, sensitiveKeys1));

        String configFile2 = "apiKey=12345\napiSecret=abcdef\nendpoint=https://api.example.com\n";
        List<String> sensitiveKeys2 = Arrays.asList("apiKey", "apiSecret");
        System.out.println("Protected Config 2:\n" + protector.hideSensitiveData(configFile2, sensitiveKeys2));

        String configFile3 = "username=user\npassword=pass\n";
        List<String> sensitiveKeys3 = Arrays.asList("username", "password");
        System.out.println("Protected Config 3:\n" + protector.hideSensitiveData(configFile3, sensitiveKeys3));
    }
}
```

### Expected Output

```shell
$ javac *.java -d build
$ java -cp build ExerciseRunner
Protected Config 1:
username=admin
password=******
host=localhost

Protected Config 2:
apiKey=*****
apiSecret=******
endpoint=https://api.example.com

Protected Config 3:
username=****
password=****
$
```

### Tips

```java
// ✅ Create a regex with groups
Pattern pattern = Pattern.compile("(\\d{4})-(\\d{2})-(\\d{2})"); // yyyy-mm-dd format
Matcher matcher = pattern.matcher("Date: 2025-10-12");

// ✅ Check and extract groups
if (matcher.find()) {
    String fullMatch = matcher.group(0); // "2025-10-12"
    String year = matcher.group(1);      // "2025"
    String month = matcher.group(2);     // "10"
    String day = matcher.group(3);       // "12"
}

// 💡 Tips:
// - Use parentheses () to create capturing groups.
// - group(0) → entire match; group(1), group(2), ... → specific parts.
// - Always call matcher.find() before accessing groups.
```
