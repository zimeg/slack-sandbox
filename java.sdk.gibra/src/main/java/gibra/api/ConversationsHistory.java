package gibra.api;

import com.slack.api.Slack;
import com.slack.api.methods.SlackApiException;
import java.util.Optional;
import java.io.IOException;
import org.apache.commons.cli.CommandLine;
import org.slf4j.LoggerFactory;

import gibra.scanner.KB;

/**
 * Experiments around the {@link ConversationsHistory} API method.
 *
 * @see {@link https://api.slack.com/methods/conversations.history}
 * @see {@link https://github.com/slackapi/java-slack-sdk/issues/1179}
 */
public class ConversationsHistory {
    public static void retreive(String token, CommandLine cmd) {
        var client = Slack.getInstance().methods();
        var logger = LoggerFactory.getLogger("gibra.logs");
        String channel = KB.get(cmd, "channel");

        if (channel.length() <= 0) {
            System.out.println("Error: Missing an argument for this snippet!");
            usage();
            return;
        }
        try {
            var result = client.conversationsHistory(r -> r
                    .token(token)
                    .channel(channel));
            var conversationHistory = Optional.ofNullable(result.getMessages());
            System.out.println(conversationHistory);
        } catch (IOException | SlackApiException e) {
            logger.error("Error: {}", e.getMessage(), e);
        }
    }

    private static void usage() {
        System.out.println("Usage: -method \"conversations.history\" -channel \"C0123456789\"");
    }
}
