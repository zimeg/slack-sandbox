// https://github.com/slackapi/java-slack-sdk/issues/1179

package snippets;

import com.slack.api.Slack;

import java.util.Optional;

import com.slack.api.methods.SlackApiException;
import java.io.IOException;
import org.slf4j.LoggerFactory;

public class Issue1179ConversationHistory {
    public static void retreive(String token, String[] args) {
        var client = Slack.getInstance().methods();
        var logger = LoggerFactory.getLogger("gibra.logs");

        if (args.length != 2) {
            System.out.println("Error: Missing an argument for this snippet!");
            usage();
            return;
        }
        String channelId = args[1];

        try {
            var result = client.conversationsHistory(r -> r
                    .token(token)
                    .channel(channelId)
                    );
            var conversationHistory = Optional.ofNullable(result.getMessages());
            System.out.println(conversationHistory);
        } catch (IOException | SlackApiException e) {
            logger.error("Error: {}", e.getMessage(), e);
        }
    }

    private static void usage() {
        System.out.println("Usage: -Pargs=\"Issue1179ConversationHistory,C0123456789\"");
    }
}
