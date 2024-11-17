package gibra.listeners.events;

import com.slack.api.app_backend.events.payload.EventsApiPayload;
import com.slack.api.bolt.context.builtin.EventContext;
import com.slack.api.bolt.handler.BoltEventHandler;
import com.slack.api.bolt.response.Response;
import com.slack.api.methods.SlackApiException;
import com.slack.api.methods.response.views.ViewsPublishResponse;
import com.slack.api.model.block.composition.BlockCompositions;
import com.slack.api.model.block.element.BlockElements;
import com.slack.api.model.event.AppHomeOpenedEvent;
import com.slack.api.model.view.View;
import java.io.IOException;
import java.time.ZonedDateTime;

import static com.slack.api.model.block.Blocks.actions;
import static com.slack.api.model.block.Blocks.asBlocks;
import static com.slack.api.model.block.Blocks.section;
import static com.slack.api.model.block.composition.BlockCompositions.markdownText;
import static com.slack.api.model.view.Views.view;

/**
 * @see {@link https://api.slack.com/events/app_home_opened}
 */
public class EventListenerAppHomeOpened implements BoltEventHandler<AppHomeOpenedEvent> {
    @Override
    public Response apply(EventsApiPayload<AppHomeOpenedEvent> payload, EventContext ctx)
            throws IOException, SlackApiException {
        ZonedDateTime now = ZonedDateTime.now();
        View appHomeView = view(view -> view.type("home")
                .blocks(asBlocks(
                        section(section -> section.text(
                                markdownText(mt -> mt.text(":hourglass: The time is now: " + now)))),
                        actions(actions -> actions
                                .elements(BlockElements.asElements(
                                        BlockElements.button(button -> button
                                                .text(BlockCompositions.plainText("Refresh"))
                                                .actionId("now"))))))));
        try {
            ViewsPublishResponse viewsPublishResponse = ctx.client()
                    .viewsPublish(
                            r -> r.userId(payload.getEvent().getUser()).view(appHomeView));
            if (!viewsPublishResponse.isOk()) {
                ctx.logger.error(viewsPublishResponse.toString());
            }
        } catch (Exception e) {
            ctx.logger.error("Failed to call views.publish API (error: {})", e.getMessage(), e);
        }
        return ctx.ack();
    }
}
