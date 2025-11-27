import React from 'react';
import { Candidate } from '../types';
import { DocumentList } from './DocumentList';

interface CandidateViewProps {
    candidate: Candidate;
    onFileUpload: (candidateId: string, documentId: string, file: File) => void;
    onSetNotApplicable: (candidateId: string, documentId: string, isNotApplicable: boolean) => void;
}

export const CandidateView: React.FC<CandidateViewProps> = ({ candidate, onFileUpload, onSetNotApplicable }) => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-t-lg border-b-4 border-primary">
                <h2 className="text-2xl font-bold text-primary">Bem-vindo(a), {candidate.name}!</h2>
                <p className="text-md text-secondary font-semibold">{candidate.jobPosition}</p>
                {candidate.jobId && (
                    <p className="text-sm text-neutral font-medium mt-1">
                        <span className="font-semibold">Código da Vaga:</span> {candidate.jobId}
                    </p>
                )}
                <p className="text-neutral mt-2">Este é o seu portal para envio de documentos admissionais. Por favor, envie os arquivos solicitados abaixo.</p>
            </div>
            <DocumentList
                documents={candidate.documents}
                viewMode="CANDIDATE"
                onFileUpload={(documentId, file) => onFileUpload(candidate.id, documentId, file)}
                onSetNotApplicable={(documentId, isNotApplicable) => onSetNotApplicable(candidate.id, documentId, isNotApplicable)}
            />
        </div>
    );
};