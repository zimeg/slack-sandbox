package gibra.listeners.events;

import com.slack.api.bolt.App;
import com.slack.api.model.event.AppHomeOpenedEvent;

import gibra.listeners.ListenerProvider;

public class EventListeners implements ListenerProvider {
    @Override
    public void register(App app) {
        app.event(AppHomeOpenedEvent.class, new EventListenerAppHomeOpened());
    }
}
