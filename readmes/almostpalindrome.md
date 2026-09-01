## Almost Palindrome

### Instructions

Create a class `AlmostPalindrome` that has a static method `isAlmostPalindrome` which accepts a string and returns `true` if the string can become a palindrome by removing **exactly one** character. If the string is already a palindrome (without removing any character) or cannot be turned into a palindrome by removing one character, the method should return `false`.

- Comparisons should be case-insensitive (e.g. 'R' and 'r' match).
- Punctuation and special characters should be treated like normal characters.

### Expected Class

```java
public class AlmostPalindrome {
    public static boolean isAlmostPalindrome(String str) {
        // your code here
    }
}
```

### Usage

Here is a possible `ExerciseRunner.java` to test your class:

```java
public class ExerciseRunner {
    public static void main(String[] args) {
        System.out.println(AlmostPalindrome.isAlmostPalindrome("radarx")); // true
        System.out.println(AlmostPalindrome.isAlmostPalindrome("example")); // false
        System.out.println(AlmostPalindrome.isAlmostPalindrome("level")); // false (already palindrome)
    }
}
```
