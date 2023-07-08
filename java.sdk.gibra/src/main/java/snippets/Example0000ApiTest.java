// https://api.slack.com/methods/api.test

package snippets;

import com.slack.api.Slack;
import com.slack.api.methods.response.api.ApiTestResponse;

import com.slack.api.methods.SlackApiException;
import java.io.IOException;
import org.slf4j.LoggerFactory;

public class Example0000ApiTest {
    public static void ping() {
        Slack slack = Slack.getInstance();
        var logger = LoggerFactory.getLogger("gibra.logs");
        try {
            ApiTestResponse response = slack.methods().apiTest(r -> r.foo("pong"));
            System.out.println(response);
        } catch (IOException | SlackApiException e) {
            logger.error("Error: {}", e.getMessage(), e);
        }
    }
}
