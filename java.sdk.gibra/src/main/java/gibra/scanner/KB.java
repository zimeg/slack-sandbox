package gibra.scanner;

import java.util.Scanner;
import org.apache.commons.cli.CommandLine;

public class KB {
    private static Scanner kb = new Scanner(System.in);

    public static String get(CommandLine cmd, String method) {
        System.out.print("Enter a value for '" + method + "': ");
        return kb.nextLine();
    }

    public static void close() {
        if (kb != null) {
            kb.close();
        }
    }
}
