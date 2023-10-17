// https://github.com/slackapi/java-slack-sdk/issues/1178

package snippets;

import com.slack.api.Slack;
import com.slack.api.methods.response.files.FilesUploadV2Response;

import java.io.File;

import com.slack.api.methods.SlackApiException;
import java.io.IOException;
import org.slf4j.LoggerFactory;

public class Issue1178FileUpload {
    public static void upload(String token, String[] args) {
        Slack slack = Slack.getInstance();
        var logger = LoggerFactory.getLogger("gibra.logs");

        if (args.length != 5) {
            System.out.println("Error: Missing an argument for this snippet!");
            usage();
            return;
        }
        String channelId = args[1];
        String filePath = args[2];
        String fileName = args[3];
        String fileTitle = args[4];

        try {
            FilesUploadV2Response v2Response = slack.methods(token).filesUploadV2(r -> r
                    .file(new File(filePath))
                    .filename(fileName)
                    .title(fileTitle)
                    .initialComment("A new file has been uploaded!")
                    .channel(channelId)
                    );
            com.slack.api.model.File v2File = v2Response.getFile();
        } catch (IOException | SlackApiException e) {
            logger.error("Error: {}", e.getMessage(), e);
        }
    }

    private static void usage() {
        System.out.println("Usage: -Pargs=\"Issue1178FileUpload,C0123456789,file_path,file_name,file_title\"");
    }
}
