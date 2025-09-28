export declare class User {
    id: number;
    email: string;
    name: string;
    password: string;
    avatar?: string;
    birthDate?: Date;
    cpf?: string;
    phone?: string;
    whatsapp?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    department?: string;
    position?: string;
    role: string;
    createdAt: Date;
    timesheetData?: any;
    currentWeekHours?: number;
    dailyTargetMinutes?: number;
    currentWeekStart?: Date;
    weekStatus?: Record<string, string>;
    isFirstAccess: boolean;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    lastPasswordChange?: Date;
    updatedAt: Date;
}
