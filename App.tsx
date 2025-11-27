import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { CandidateView } from './components/CandidateView';
import { AdminView } from './components/AdminView';
import { Spinner } from './components/Spinner';
import { UserCheck, Users } from './components/IconComponents';
import { extractDataFromDocument } from './services/geminiService';
import { Candidate, ViewMode } from './types';
import { initialCandidates } from './mockData';
import { fileToBase64 } from './utils/fileUtils';
import { createDefaultDocumentList } from './utils/candidateUtils';

// Define a type for the candidates coming from the API to use in the import function
interface ApiCandidate {
    id: string;
    name: string;
    email: string;
    jobPosition: string;
    jobId: string;
}

const App: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
    const [viewMode, setViewMode] = useState<ViewMode>('CANDIDATE');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateCandidateDocument = useCallback((candidateId: string, documentId: string, updates: object) => {
        setCandidates(prevCandidates =>
            prevCandidates.map(c =>
                c.id === candidateId
                    ? {
                        ...c,
                        documents: c.documents.map(d =>
                            d.id === documentId ? { ...d, ...updates, lastUpdated: new Date().toLocaleString('pt-BR') } : d
                        ),
                    }
                    : c
            )
        );
    }, []);

    const handleFileUpload = useCallback(async (candidateId: string, documentId: string, file: File) => {
        setIsLoading(true);
        setError(null);
        
        // Simulates renaming the file based on its description for archival, as requested.
        const fileExtension = file.name.split('.').pop();
        const documentName = candidates.find(c => c.id === candidateId)?.documents.find(d => d.id === documentId)?.name.replace(/\s/g, '_');
        const newFileName = `${documentName}.${fileExtension}`;

        const fileUrl = URL.createObjectURL(file);
        updateCandidateDocument(candidateId, documentId, { status: 'ANALYSING', fileName: newFileName, fileUrl });

        try {
            const base64Data = await fileToBase64(file);
            const extractedData = await extractDataFromDocument(base64Data, file.type);
            
            // In a real app, this would stay 'ANALYSING' for manual review.
            // Here, we auto-approve on successful OCR for demonstration.
            updateCandidateDocument(candidateId, documentId, { status: 'APPROVED', extractedData });
            
            // Simulate sending email notification
            console.log(`Email de notificação enviado para ${candidates.find(c=>c.id === candidateId)?.email}: Documento '${file.name}' Aprovado!`);

        } catch (err) {
            console.error("Extraction error:", err);
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setError(`Erro na extração de dados: ${errorMessage}`);
            updateCandidateDocument(candidateId, documentId, { status: 'REJECTED', rejectionReason: 'Falha no processamento do arquivo. Por favor, envie novamente.' });
        } finally {
            setIsLoading(false);
        }
    }, [updateCandidateDocument, candidates]);

    const handleApprove = useCallback((candidateId: string, documentId: string) => {
        updateCandidateDocument(candidateId, documentId, { status: 'APPROVED', rejectionReason: undefined });
    }, [updateCandidateDocument]);

    const handleReject = useCallback((candidateId: string, documentId: string) => {
        const reason = prompt("Por favor, informe o motivo da rejeição:");
        if (reason) {
            updateCandidateDocument(candidateId, documentId, { status: 'REJECTED', rejectionReason: reason });
             // Simulate sending email notification
            console.log(`Email de notificação enviado para ${candidates.find(c=>c.id === candidateId)?.email}: Documento pendente. Motivo: ${reason}`);
        }
    }, [updateCandidateDocument, candidates]);

    const handleSetNotApplicable = useCallback((candidateId: string, documentId: string, isNotApplicable: boolean) => {
        const newStatus = isNotApplicable ? 'NOT_APPLICABLE' : 'PENDING';
        updateCandidateDocument(candidateId, documentId, { status: newStatus, fileName: undefined, fileUrl: undefined });
    }, [updateCandidateDocument]);

    const handleScheduleExam = useCallback((candidateId: string, date: string) => {
        setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, medicalExamDate: date } : c));
        // Simulate sending email notification with exam date
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
            console.log(`Email com data do exame (${date}) enviado para ${candidate.email}.`);
            alert(`Exame agendado para ${candidate.name} em ${date} e candidato notificado!`);
        }
    }, [candidates]);
    
    const handleImportCandidates = useCallback((imported: ApiCandidate[]) => {
        const existingEmails = new Set(candidates.map(c => c.email));
        
        const newCandidates = imported
            .filter(apiCand => !existingEmails.has(apiCand.email)) // Prevent duplicates
            .map((apiCand, index) => ({
                id: `cand_${Date.now()}_${index}`,
                name: apiCand.name,
                email: apiCand.email,
                jobPosition: apiCand.jobPosition,
                jobId: apiCand.jobId,
                documents: createDefaultDocumentList(),
                medicalExamDate: null,
            }));
        
        if (newCandidates.length > 0) {
            setCandidates(prev => [...prev, ...newCandidates]);
            alert(`${newCandidates.length} candidato(s) importado(s) com sucesso para o processo de admissão!`);
        } else {
            alert('Nenhum candidato novo para importar. Os candidatos selecionados já existem no sistema.');
        }
    }, [candidates]);

    // For demonstration, we use the first candidate for the Candidate View
    const currentCandidate = candidates[0];

    return (
        <div className="min-h-screen bg-light-bg text-gray-800 font-sans">
            {isLoading && <Spinner />}
            <Header />
            
            <div className="container mx-auto p-4 md:p-8">
                {/* View Mode Switcher */}
                <div className="max-w-md mx-auto mb-8 p-1.5 bg-gray-200 rounded-lg flex justify-center space-x-2">
                    <button onClick={() => setViewMode('CANDIDATE')} className={`w-full py-2 px-4 rounded-md text-sm font-bold transition-colors ${viewMode === 'CANDIDATE' ? 'bg-white text-primary shadow' : 'bg-transparent text-neutral'}`}>
                        <UserCheck className="h-5 w-5 mr-2 inline-block"/>
                        Visão do Candidato
                    </button>
                    <button onClick={() => setViewMode('ADMIN')} className={`w-full py-2 px-4 rounded-md text-sm font-bold transition-colors ${viewMode === 'ADMIN' ? 'bg-white text-secondary shadow' : 'bg-transparent text-neutral'}`}>
                        <Users className="h-5 w-5 mr-2 inline-block"/>
                        Visão da Admissão
                    </button>
                </div>

                <main>
                    {viewMode === 'CANDIDATE' ? (
                        <CandidateView
                            candidate={currentCandidate}
                            onFileUpload={handleFileUpload}
                            onSetNotApplicable={handleSetNotApplicable}
                        />
                    ) : (
                        <AdminView
                            candidates={candidates}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onScheduleExam={handleScheduleExam}
                            onImportCandidates={handleImportCandidates}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;