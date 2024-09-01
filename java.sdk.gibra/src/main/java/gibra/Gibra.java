package gibra;

import com.slack.api.bolt.App;
import com.slack.api.bolt.AppConfig;
import com.slack.api.bolt.socket_mode.SocketModeApp;
import java.util.Optional;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.Option;
import org.apache.commons.cli.ParseException;

import gibra.api.ApiTest;
import gibra.api.ConversationsHistory;
import gibra.api.FilesUploadV2;
import gibra.listeners.Listeners;
import gibra.scanner.KB;

/**
 * This app chooses to do two things that might not be so related depending on
 * the mode the app is running in.
 *
 * @apiNote Valid modes are either "api" or "bolt".
 */
public class Gibra {
    public static void main(String[] args) throws Exception {
        Options options = options();
        CommandLineParser parser = new DefaultParser();
        HelpFormatter formatter = new HelpFormatter();
        try {
            CommandLine cmd = parser.parse(options, args);
            String mode = Optional.ofNullable(System.getenv("SLACK_APP_MODE")).orElse("");
            switch (cmd.getOptionValue("mode", mode)) {
                case "bolt":
                    run();
                    break;
                case "api":
                    method(cmd);
                    break;
                default:
                    throw new Error("Unknown app mode found! Hint: \"-mode bolt\"");
            }
        } catch (ParseException e) {
            System.out.println(e.getMessage());
            formatter.printHelp("Gibra", options);
        }
    }

    /**
     * Collect the commaned line options that are used in various API methods.
     */
    private static Options options() {
        Options options = new Options();
        Option channel = new Option("channel", true, "Slack channel ID");
        Option filepath = new Option("filepath", true, "File path");
        Option help = new Option("help", false, "Some helpful message");
        Option method = new Option("method", true, "Slack API method");
        Option mode = new Option("mode", true, "Variation of app");
        options.addOption(channel);
        options.addOption(filepath);
        options.addOption(help);
        options.addOption(method);
        options.addOption(mode);
        return options;
    }

    /**
     * Start the Bolt server using a Socket Mode setup.
     */
    private static void run() throws Exception {
        AppConfig appConfig = AppConfig.builder()
                .singleTeamBotToken(System.getenv("SLACK_BOT_TOKEN"))
                .build();
        App app = new App(appConfig);
        SocketModeApp server = new SocketModeApp(
                System.getenv("SLACK_APP_TOKEN"),
                app);
        Listeners.register(app);
        server.start();
    }

    /**
     * Call the provided Slack API method with command configurations.
     */
    private static void method(CommandLine cmd) throws Exception {
        String help = cmd.getOptionValue("help", "");
        String method = KB.get(cmd, "method");
        String token = System.getenv("SLACK_BOT_TOKEN");
        if (!help.isBlank() || method.length() == 0) {
            help();
            return;
        }
        switch (method) {
            case "api.test":
                ApiTest.ping();
                break;
            case "conversations.history":
                ConversationsHistory.retreive(token, cmd);
                break;
            case "files.upload":
                FilesUploadV2.upload(token, cmd);
                break;
            default:
                System.err.println(
                        String.format("Slack API method '%s' not implemented!", method));
                help();
                break;
        }
        KB.close();
    }

    /**
     * Remind the caller of options to use.
     */
    private static void help() {
        System.out.println("Available Slack API methods include:");
        System.out.println(" - api.test");
        System.out.println(" - files.upload");
        System.out.println(" - conversations.history");
        System.out.println("Hint: Use the '-method \"files.upload\"' argument.");
    }
}
