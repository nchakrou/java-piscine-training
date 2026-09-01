## Date Formatter

### Instructions

Create a class named **`DateFormatter`** with the following specifications:

##### Attributes

- **`date`**: the date to be formatted, stored as a UNIX timestamp in seconds.
- **`format`**: the format string to which the date should be converted.
- **`formattedDate`**: the result of converting the `date` into the specified `format` (always in the **UTC** timezone).

##### Behavior

- Provide **getters** for all attributes.
- Provide **setters** for `date` and `format`.
  - When either `date` or `format` is updated, the conversion should run automatically.
  - If the `format` is invalid, the conversion must be skipped (the previous `formattedDate` should remain unchanged).

##### Constructors

- A constructor with only `date`.
- A constructor with `date` and `format`.
- A default constructor:
  - The default `date` is the current date (current UNIX time).
  - The default `format` is **`DD/MM/YYYY`** (case-insensitive).

> Note: You may use standard Java libraries for converting UNIX timestamps to dates and extracting date components.

#### The accepted date formats are:

- `DD/MM/YYYY`
- `DD Month YYYY`
- `DD.MM.YYYY`

### Expected Functions

```java
import java.util.Date;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

public class DateFormatter {
    private long date;
    private String formattedDate;
    private String format;

    ...
}
```

### Usage

Here is a possible `ExerciseRunner.java` to test your class:

```java
public class ExerciseRunner {
    public static void main(String[] args) {
        DateFormatter df = new DateFormatter(1656374400, "DD/MM/YYYY");
        System.out.println(df.getFormattedDate());

        df.setFormat("dd.MM.yyyy");
        System.out.println(df.getFormattedDate());

        df.setDate(1672531199);
        System.out.println(df.getFormattedDate());

        df.setFormat("DD month yyyy");
        System.out.println(df.getFormattedDate());
    }
}
```

### Expected Output

```shell
$ javac *.java -d build
$ java -cp build ExerciseRunner
28/06/2022
28.06.2022
31.12.2022
31 December 2022
$
```

### Tip — How to Extract Day, Month, and Year from a Date

```java
// Get the current time in seconds since the epoch (UTC)
long currentDateInSeconds = System.currentTimeMillis() / 1000L;

// Create a Date from the UTC timestamp (convert seconds to milliseconds)
Date dateObj = new Date(currentDateInSeconds * 1000);

// Create a Calendar in the UTC time zone and set the date
Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
calendar.setTime(dateObj);

// Extract the date components
int day = calendar.get(Calendar.DAY_OF_MONTH);
String month = getMonth(calendar.get(Calendar.MONTH));
int year = calendar.get(Calendar.YEAR);
```
