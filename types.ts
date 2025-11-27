export type DocumentStatus = 'PENDING' | 'ANALYSING' | 'APPROVED' | 'REJECTED' | 'NOT_APPLICABLE';

export interface DocumentData {
    [key: string]: string;
}

export interface Document {
    id: string;
    name: string;
    status: DocumentStatus;
    optional?: boolean;
    fileUrl?: string;
    fileName?: string;
    extractedData?: DocumentData | null;
    rejectionReason?: string;
    lastUpdated: string;
}

export interface Candidate {
    id: string;
    name: string;
    email: string;
    jobPosition: string; // Cargo adicionado
    jobId?: string; // ID da Vaga adicionado
    documents: Document[];
    medicalExamDate?: string | null;
}

export type ViewMode = 'CANDIDATE' | 'ADMIN';