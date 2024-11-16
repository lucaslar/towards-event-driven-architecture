export class NavItem {
    constructor(
        readonly icon: string,
        readonly translationKey: string,
        readonly onClick: () => any,
        readonly color?: 'primary' | 'accent' | 'warn',
        readonly disabled?: () => boolean
    ) {}
}
