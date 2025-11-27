import { Candidate } from '../types';

export const getOverallStatus = (candidate: Candidate) => {
    const total = candidate.documents.length;
    const completed = candidate.documents.filter(d => d.status === 'APPROVED' || d.status === 'NOT_APPLICABLE').length;
    
    if (total === completed) return { text: 'Completo', color: 'bg-green-100 text-green-800', isComplete: true };
    if (candidate.documents.some(d => d.status === 'REJECTED')) return { text: 'Pendências', color: 'bg-red-100 text-red-800', isComplete: false };
    if (candidate.documents.some(d => d.status === 'ANALYSING')) return { text: 'Em Análise', color: 'bg-yellow-100 text-yellow-800', isComplete: false };
    return { text: 'Aguardando Documentos', color: 'bg-gray-200 text-gray-800', isComplete: false };
};
