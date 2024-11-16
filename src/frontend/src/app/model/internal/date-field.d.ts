export type DateField = {
    year?: number;
    date?: Date;
    yearOnly: boolean;
    operator: 'eq' | 'lt' | 'gt';
};
