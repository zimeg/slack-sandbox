package gibra.listeners;

import com.slack.api.bolt.App;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import gibra.listeners.actions.ActionListeners;
import gibra.listeners.events.EventListeners;

public class Listeners {
    public static Logger logger = LoggerFactory.getLogger(Listeners.class);

    public static void register(App app) {
        for (ListenerProvider provider : getAllListeners()) {
            provider.register(app);
            logger.debug("{} registered", provider.getClass().getSimpleName());
        }
    }

    private static ListenerProvider[] getAllListeners() {
        return new ListenerProvider[] {
                new ActionListeners(),
                new EventListeners(),
        };
    }
}
