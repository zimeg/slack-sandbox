package gibra.listeners.actions;

import com.slack.api.bolt.App;

import gibra.listeners.ListenerProvider;

public class ActionListeners implements ListenerProvider {
    @Override
    public void register(App app) {
        app.blockAction(ActionListenerNow.actionId(), new ActionListenerNow());
    }
}
