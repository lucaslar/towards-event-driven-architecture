import {
    faAtom,
    faBook,
    faHeartPulse,
    faMoneyCheckDollar,
    faPeace,
    faVial,
    IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

export const laureateServiceMap: { [k: string]: { icon: IconDefinition } } = {
    Peace: { icon: faPeace },
    Literature: { icon: faBook },
    Physics: { icon: faAtom },
    Chemistry: { icon: faVial },
    'Physiology or Medicine': { icon: faHeartPulse },
    'Economic Sciences': { icon: faMoneyCheckDollar },
};
