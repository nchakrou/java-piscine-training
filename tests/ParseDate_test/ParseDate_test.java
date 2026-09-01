import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(StopAfterFailureExtension.class)
class ParseDateTest {

    @Test
    void parseIsoFormat_shouldReturnTheDate() {
        LocalDateTime date = LocalDateTime.of(2021, 10, 27, 16, 52, 31, 12345);

        LocalDateTime res = ParseDate.parseIsoFormat(date.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        assertThat(res)
                .withFailMessage("Should return %s, but was %s", date.toString(), res.toString())
                .isEqualTo(date);
    }

    @Test
    void parseIsoFormat_shouldReturnNull_whenStringIsNull() {
        LocalDateTime res = ParseDate.parseIsoFormat(null);

        assertThat(res)
                .withFailMessage("Should return null, but was not")
                .isNull();
    }

    @Test
    void parseFullTextFormat_shouldReturnTheDate() {
        LocalDate date = LocalDate.of(2018, 5, 18);

        LocalDate res = ParseDate.parseFullTextFormat(date.format(DateTimeFormatter.ofPattern("EEEE dd MMMM yyyy", Locale.ENGLISH)));

        assertThat(res)
                .withFailMessage("Should return %s, but was %s", date.toString(), res.toString())
                .isEqualTo(date);
    }

    @Test
    void parseFullTextFormat_shouldReturnNull_whenStringIsNull() {
        LocalDate res = ParseDate.parseFullTextFormat(null);

        assertThat(res)
                .withFailMessage("Should return null, but was not")
                .isNull();
    }

    @Test
    void parseTimeFormat_shouldReturnTheDatePM() {
        LocalTime date = LocalTime.of(18, 10, 54);
        String stringDate = date.format(DateTimeFormatter.ofPattern("hh 'hours' B, mm 'minutes and' ss 'seconds'", Locale.ENGLISH));
        System.out.println(stringDate);
        LocalTime res = ParseDate.parseTimeFormat(stringDate);

        assertThat(res)
                .withFailMessage("Should return %s, but was %s", date.toString(), res.toString())
                .isEqualTo(date);
    }

    @Test
    void parseTimeFormat_shouldReturnTheDateAM() {
        LocalTime date = LocalTime.of(8, 20, 54);
        String stringDate = date.format(DateTimeFormatter.ofPattern("hh 'hours' B, mm 'minutes and' ss 'seconds'", Locale.ENGLISH));
        System.out.println(stringDate);
        LocalTime res = ParseDate.parseTimeFormat(stringDate);

        assertThat(res)
                .withFailMessage("Should return %s, but was %s", date.toString(), res.toString())
                .isEqualTo(date);
    }

    @Test
    void parseTimeFormat_shouldReturnNull_whenStringIsNull() {
        LocalTime res = ParseDate.parseTimeFormat(null);

        assertThat(res)
                .withFailMessage("Should return null, but was not")
                .isNull();
    }

}