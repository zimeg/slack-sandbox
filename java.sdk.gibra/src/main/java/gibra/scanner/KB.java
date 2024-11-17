package gibra.scanner;

import java.util.Scanner;
import org.apache.commons.cli.CommandLine;

public class KB {
    private static Scanner kb = new Scanner(System.in);

    public static String get(CommandLine cmd, String option) {
        String flag = cmd.getOptionValue(option, "");
        if (flag != "") {
            return flag;
        }
        System.out.print("Enter a value for '" + option + "': ");
        return kb.nextLine();
    }

    public static void close() {
        if (kb != null) {
            kb.close();
        }
    }
}
