import io.github.cdimascio.dotenv.Dotenv;

import snippets.Example0000ApiTest;

import snippets.Issue1178FileUpload;
import snippets.Issue1179ConversationHistory;

public class App {
    public static void main(String[] args) throws Exception {
        Dotenv dotenv = Dotenv.load();
        String token = dotenv.get("SLACK_BOT_TOKEN");

        if (args.length == 0) {
            help();
            return;
        }
        switch (args[0]) {
            case "Example0000ApiTest":
                Example0000ApiTest.ping();
                break;
            case "Issue1178FileUpload":
                Issue1178FileUpload.upload(token, args);
                break;
            case "Issue1179ConversationHistory":
                Issue1179ConversationHistory.retreive(token, args);
                break;
            default:
                String message = String.format("Command '%s' not found!", args[0]);
                System.out.println(message);
                help();
                break;
        }
        return;
    }

    private static void help() {
        System.out.println("Include an option with the -Pargs=\"command_name\" flag!");
        System.out.println("Available options include:");
        System.out.println(" - Example0000ApiTest");
        System.out.println(" - Issue1178FileUpload");
        System.out.println(" - Issue1179ConversationHistory");
    }
}
