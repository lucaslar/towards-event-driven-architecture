import {
    transition,
    trigger,
    query,
    style,
    animate,
    group,
    AnimationQueryMetadata,
    AnimationGroupMetadata,
} from '@angular/animations';

const duration = 0.3;

const slidingAnimationSteps = (
    readingDirection: boolean,
    translateName: 'translateX' | 'translateY' = 'translateX'
): (AnimationQueryMetadata | AnimationGroupMetadata)[] => {
    return [
        query(
            ':enter, :leave',
            style({
                position: 'fixed',
                width: 'calc(100% - 48px)',
                maxWidth: 'calc(1600px)',
                height: 'calc(100% - 120px)',
            }),
            { optional: true }
        ),
        group([
            query(
                ':enter',
                [
                    style({
                        transform: `${translateName}(${
                            readingDirection ? 100 : -100
                        }%)`,
                    }),
                    animate(
                        `${duration}s ease-in-out`,
                        style({ opacity: 1, transform: `${translateName}(0%)` })
                    ),
                ],
                { optional: true }
            ),
            query(
                ':leave',
                [
                    style({ transform: `${translateName}(0%)` }),
                    animate(
                        `${duration}s ease-in-out`,
                        style({
                            opacity: 0,
                            transform: `${translateName}(${
                                readingDirection ? -100 : 100
                            }%)`,
                        })
                    ),
                ],
                { optional: true }
            ),
        ]),
    ];
};

const horizontalSliding = (
    ltr: boolean
): (AnimationQueryMetadata | AnimationGroupMetadata)[] => {
    return slidingAnimationSteps(ltr);
};

const verticalSliding = (
    topToBottom: boolean
): (AnimationQueryMetadata | AnimationGroupMetadata)[] => {
    return slidingAnimationSteps(topToBottom, 'translateY');
};

export const slideAnimation = trigger('routeAnimations', [
    transition('Home => Configurations', horizontalSliding(false)),
    transition('Configurations => Home', horizontalSliding(true)),
    transition('Home => Current', verticalSliding(true)),
    transition('Current => Home', verticalSliding(false)),
    transition('Home => Avgs', horizontalSliding(true)),
    transition('Avgs => Home', horizontalSliding(false)),
]);
