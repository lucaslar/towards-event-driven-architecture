package de.htwberlin.lla.master.towardseda.sample04.prizeservice.amqp.export;

import de.htwberlin.lla.master.towardseda.sample04.prizeservice.prize.export.model.Prize;

import java.util.List;

/**
 * Controller defining all methods in relation to efferent, i.e. published, events.
 */
public interface RabbitEfferent {

    /**
     * Initializes all channels the client writes to.
     */
    void initializeChannels();

    /**
     * Publishes an event informing about found laureates to the respective exchange.
     *
     * @param uuid   UUID of the initiating query request.
     * @param prizes Prizes data to be published.
     * @param scope  Service scope, i.e. Nobel Prize category of the initiating service.
     */
    void publishPrizesFound(final String uuid, final List<Prize> prizes, final String scope);

    /**
     * Publishes an event informing about an error that occurred on searching for laureates.
     *
     * @param uuid    UUID of the initiating query request.
     * @param message Error message.
     * @param scope   Service scope, i.e. Nobel Prize category of the initiating service.
     */
    void publishPrizeSearchError(final String uuid, final String message, final String scope);
}
