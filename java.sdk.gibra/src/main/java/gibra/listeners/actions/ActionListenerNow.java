package gibra.listeners.actions;

import com.slack.api.bolt.context.builtin.ActionContext;
import com.slack.api.bolt.handler.builtin.BlockActionHandler;
import com.slack.api.bolt.request.builtin.BlockActionRequest;
import com.slack.api.bolt.response.Response;
import com.slack.api.methods.SlackApiException;
import com.slack.api.methods.response.views.ViewsPublishResponse;
import com.slack.api.model.view.View;
import com.slack.api.model.block.Blocks;
import com.slack.api.model.block.composition.BlockCompositions;
import com.slack.api.model.block.element.BlockElements;
import java.io.IOException;
import java.time.ZonedDateTime;

import static com.slack.api.model.block.Blocks.asBlocks;

/*
 * @see {@link https://api.slack.com/interactivity/handling}
 */
public class ActionListenerNow implements BlockActionHandler {
    public static String actionId() {
        return "now";
    }

    @Override
    public Response apply(BlockActionRequest req, ActionContext ctx)
            throws IOException, SlackApiException {
        ZonedDateTime now = ZonedDateTime.now();
        View appHomeView = View.builder()
                .type("home")
                .blocks(asBlocks(
                        Blocks.section(section -> section.text(
                                BlockCompositions.markdownText(":hourglass: The time is now: " + now))),
                        Blocks.actions(actions -> actions
                                .elements(BlockElements.asElements(
                                        BlockElements.button(button -> button
                                                .text(BlockCompositions.plainText("Refresh"))
                                                .actionId("now")))))))
                .build();
        try {
            ViewsPublishResponse viewsPublishResponse = ctx.client()
                    .viewsPublish(
                            r -> r.userId(req.getPayload().getUser().getId()).view(appHomeView));
            if (!viewsPublishResponse.isOk()) {
                ctx.logger.error(viewsPublishResponse.toString());
            }
        } catch (Exception e) {
            ctx.logger.error("Failed to call views.publish API (error: {})", e.getMessage(), e);
        }
        return ctx.ack();
    }
}
