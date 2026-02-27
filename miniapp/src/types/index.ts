export interface ScheduleItem {
    id: number;
    "Форма обучения": string;
    "Уровень образования": string;
    "Курс": number;
    "Институт": string;
    "Направление": string;
    "Программа": string;
    "Номер группы": string;
    "День недели": string;
    "Номер пары": number;
    "Время пары": string;
    "Чётность": string; // "1" for Odd, "2" for Even, "0" for Both
    "Предмет": string;
    "Вид пары": string;
    "Преподаватель": string;
    "Номер аудитории": string;
    "Недели": string;
}

export interface UserProfile {
    user_id: string;
    username?: string;
    "Форма обучения"?: string;
    "Уровень образования"?: string;
    "Курс"?: number;
    "Институт"?: string;
    "Направление"?: string;
    "Программа"?: string;
    "Номер группы"?: string;
    profile_completed: boolean;
}

export interface ApiResponse<T> {
    success?: boolean;
    data?: T;
    error?: string;
    message?: string;
}
