package gibra.api;

import com.slack.api.Slack;
import com.slack.api.methods.SlackApiException;
import com.slack.api.methods.response.files.FilesUploadV2Response;
import com.slack.api.model.File;
import java.io.IOException;
import org.apache.commons.cli.CommandLine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import gibra.scanner.KB;

/**
 * Implementation of file uploads with polling patterns for asynchronous upload.
 *
 * @see {@link https://github.com/slackapi/java-slack-sdk/pull/1065}
 * @see {@link https://github.com/slackapi/java-slack-sdk/issues/1178}
 */
public class FilesUploadV2 {
    public static void upload(String token, CommandLine cmd) {
        Logger logger = LoggerFactory.getLogger("gibra.logs");
        Slack slack = Slack.getInstance();
        String channel = KB.get(cmd, "channel");
        String filepath = KB.get(cmd, "filepath");
        if (channel.length() <= 0 || filepath.length() <= 0) {
            System.out.println("Error: Missing an argument for this method!");
            usage();
            return;
        }
        try {
            FilesUploadV2Response v2Response = slack.methods(token).filesUploadV2(r -> r
                    .file(new java.io.File(filepath))
                    .channel(channel));
            File v2File = v2Response.getFile();
            System.out.println(v2File);
        } catch (IOException | SlackApiException e) {
            logger.error("Error: {}", e.getMessage(), e);
        }
    }

    private static void usage() {
        System.out.println("Usage: -method \"files.upload\" -channel \"C0123456789\" -filepath \"example.out\"");
    }
}
