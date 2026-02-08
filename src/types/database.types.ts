export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            events: {
                Row: {
                    id: string
                    name: string
                    event_code: string
                    created_by: string
                    created_at: string
                    starts_at: string | null
                    ends_at: string | null
                    status: 'draft' | 'active' | 'ended'
                    settings: Json
                }
                Insert: {
                    id?: string
                    name: string
                    event_code: string
                    created_by: string
                    created_at?: string
                    starts_at?: string | null
                    ends_at?: string | null
                    status?: 'draft' | 'active' | 'ended'
                    settings?: Json
                }
                Update: {
                    id?: string
                    name?: string
                    event_code?: string
                    created_by?: string
                    created_at?: string
                    starts_at?: string | null
                    ends_at?: string | null
                    status?: 'draft' | 'active' | 'ended'
                    settings?: Json
                }
            }
            questions: {
                Row: {
                    id: string
                    event_id: string
                    content: string
                    submitted_at: string
                    status: 'pending' | 'approved' | 'rejected'
                    moderated_by: string | null
                    moderated_at: string | null
                    displayed_at: string | null
                }
                Insert: {
                    id?: string
                    event_id: string
                    content: string
                    submitted_at?: string
                    status?: 'pending' | 'approved' | 'rejected'
                    moderated_by?: string | null
                    moderated_at?: string | null
                    displayed_at?: string | null
                }
                Update: {
                    id?: string
                    event_id?: string
                    content?: string
                    submitted_at?: string
                    status?: 'pending' | 'approved' | 'rejected'
                    moderated_by?: string | null
                    moderated_at?: string | null
                    displayed_at?: string | null
                }
            }
            polls: {
                Row: {
                    id: string
                    event_id: string
                    question: string
                    options: Json // Array of {id: string, text: string, votes: number}
                    poll_type: 'single' | 'multiple'
                    created_at: string
                    active: boolean
                    activated_at: string | null
                    ended_at: string | null
                    total_votes: number
                }
                Insert: {
                    id?: string
                    event_id: string
                    question: string
                    options: Json
                    poll_type?: 'single' | 'multiple'
                    created_at?: string
                    active?: boolean
                    activated_at?: string | null
                    ended_at?: string | null
                    total_votes?: number
                }
                Update: {
                    id?: string
                    event_id?: string
                    question?: string
                    options?: Json
                    poll_type?: 'single' | 'multiple'
                    created_at?: string
                    active?: boolean
                    activated_at?: string | null
                    ended_at?: string | null
                    total_votes?: number
                }
            }
            poll_votes: {
                Row: {
                    id: string
                    poll_id: string
                    option_ids: Json // Array of strings
                    voted_at: string
                    session_id: string
                }
                Insert: {
                    id?: string
                    poll_id: string
                    option_ids: Json
                    voted_at?: string
                    session_id: string
                }
                Update: {
                    id?: string
                    poll_id?: string
                    option_ids?: Json
                    voted_at?: string
                    session_id?: string
                }
            }
            users: {
                Row: {
                    id: string
                    email: string
                    role: 'admin' | 'moderator'
                    created_at: string
                    last_login: string | null
                }
                Insert: {
                    id: string
                    email: string
                    role?: 'admin' | 'moderator'
                    created_at?: string
                    last_login?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'admin' | 'moderator'
                    created_at?: string
                    last_login?: string | null
                }
            }
            event_access: {
                Row: {
                    id: string
                    user_id: string
                    event_id: string
                    role: 'moderator' | 'viewer'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    event_id: string
                    role?: 'moderator' | 'viewer'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    event_id?: string
                    role?: 'moderator' | 'viewer'
                    created_at?: string
                }
            }
        }
    }
}
