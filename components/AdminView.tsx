import React, { useState } from 'react';
import { Candidate, Document } from '../types';
import { DocumentList } from './DocumentList';
import { Users, Calendar, X } from './IconComponents';
import { getOverallStatus } from '../utils/statusUtils';
import { AdminDashboard } from './AdminDashboard';
import { ApiExportView } from './ApiExportView';

// Define a type for the candidates coming from the API to use in the import function
interface ApiCandidate {
    id: string;
    name: string;
    email: string;
    jobPosition: string;
    jobId: string;
}
interface AdminViewProps {
    candidates: Candidate[];
    onApprove: (candidateId: string, documentId: string) => void;
    onReject: (candidateId: string, documentId: string) => void;
    onScheduleExam: (candidateId: string, date: string) => void;
    onImportCandidates: (candidates: ApiCandidate[]) => void;
}

const getExtractedInfo = (documents: Document[], key: 'cpf' | 'rg'): string => {
    for (const doc of documents) {
        if (doc.extractedData) {
            if (key === 'rg' && (doc.extractedData['documentNumber'])) {
                return doc.extractedData['documentNumber'];
            }
             if (key === 'cpf' && (doc.extractedData['cpf'])) {
                return doc.extractedData['cpf'];
            }
        }
    }
    return 'N/A';
};


const ReportsView: React.FC<{ candidates: Candidate[] }> = ({ candidates }) => {

    const generateCSV = () => {
        // Changed separator to semicolon for Excel compatibility in certain regions (e.g., Brazil)
        const headers = "Nome Completo;ID da Vaga;Cargo;RG;CPF;Data Exame Admissional\n";

        const rows = candidates.map(candidate => {
            const name = `"${candidate.name}"`;
            const jobId = `"${(candidate.jobId || 'N/A').replace(/\n/g, ' ')}"`;
            const jobPosition = `"${candidate.jobPosition}"`;
            const rg = `"${getExtractedInfo(candidate.documents, 'rg')}"`;
            const cpf = `"${getExtractedInfo(candidate.documents, 'cpf')}"`;
            const examDate = `"${candidate.medicalExamDate || 'Não agendado'}"`;
            // Changed join character to semicolon
            return [name, jobId, jobPosition, rg, cpf, examDate].join(';');
        }).join('\n');

        const csvContent = headers + rows;
        
        // Use a Blob for better file handling and add a BOM for Excel compatibility
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "relatorio_admissao.csv");
        document.body.appendChild(link);
        link.click();
        
        // Clean up the created URL
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-700">Relatório de Candidatos</h3>
                <button onClick={generateCSV} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-opacity-90">Exportar CSV</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome Completo</th>
                            <th scope="col" className="px-6 py-3">ID da Vaga</th>
                            <th scope="col" className="px-6 py-3">Cargo</th>
                            <th scope="col" className="px-6 py-3">RG (Extraído)</th>
                            <th scope="col" className="px-6 py-3">CPF (Extraído)</th>
                            <th scope="col" className="px-6 py-3">Data Exame Admissional</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map(candidate => (
                            <tr key={candidate.id} className="bg-white border-b">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{candidate.name}</th>
                                <td className="px-6 py-4">{candidate.jobId || 'N/A'}</td>
                                <td className="px-6 py-4">{candidate.jobPosition}</td>
                                <td className="px-6 py-4">{getExtractedInfo(candidate.documents, 'rg')}</td>
                                <td className="px-6 py-4">{getExtractedInfo(candidate.documents, 'cpf')}</td>
                                <td className="px-6 py-4">{candidate.medicalExamDate || 'Não agendado'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const CalendarModal: React.FC<{
    candidate: Candidate;
    onConfirm: (date: string) => void;
    onCancel: () => void;
}> = ({ candidate, onConfirm, onCancel }) => {
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [time, setTime] = useState('09:00');

    const handleConfirm = () => {
        if (!date || !time) {
            alert('Por favor, selecione data e hora.');
            return;
        }
        // Format date from YYYY-MM-DD to DD/MM/YYYY
        const [year, month, day] = date.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        onConfirm(`${formattedDate} ${time}`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                 <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                </button>
                <h3 className="text-lg font-bold text-secondary mb-2">Agendar Exame Admissional</h3>
                <p className="text-neutral mb-4">Para: <span className="font-semibold">{candidate.name}</span></p>
               
                <div className="space-y-4">
                    <div>
                        <label htmlFor="exam-date" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <input
                            id="exam-date"
                            type="date"
                            value={date}
                            min={today}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="exam-time" className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                        <input
                            id="exam-time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onCancel} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleConfirm} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
                        Confirmar Agendamento
                    </button>
                </div>
            </div>
        </div>
    );
};


export const AdminView: React.FC<AdminViewProps> = ({ candidates, onApprove, onReject, onScheduleExam, onImportCandidates }) => {
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(candidates[0] || null);
    const [adminSubView, setAdminSubView] = useState<'summary' | 'documents' | 'reports' | 'export'>('summary');
    const [schedulingCandidate, setSchedulingCandidate] = useState<Candidate | null>(null);

    const selectedCandidateStatus = selectedCandidate ? getOverallStatus(selectedCandidate) : null;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {schedulingCandidate && (
                <CalendarModal 
                    candidate={schedulingCandidate}
                    onCancel={() => setSchedulingCandidate(null)}
                    onConfirm={(dateTime) => {
                        onScheduleExam(schedulingCandidate.id, dateTime);
                        setSchedulingCandidate(null);
                    }}
                />
            )}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-secondary flex items-center"><Users className="mr-3"/>Painel de Admissão</h2>
                         <p className="text-neutral mt-1">
                            {adminSubView === 'summary' && 'Resumo geral do processo de admissão.'}
                            {adminSubView === 'documents' && 'Selecione um candidato para visualizar e validar os documentos enviados.'}
                            {adminSubView === 'reports' && 'Gere e exporte relatórios consolidados dos candidatos.'}
                            {adminSubView === 'export' && 'Conecte a uma API externa para consultar e exportar dados de candidatos.'}
                        </p>
                    </div>
                    <div className="flex p-1 bg-gray-200 rounded-md space-x-1">
                        <button onClick={() => setAdminSubView('summary')} className={`px-3 py-1 text-sm font-semibold rounded ${adminSubView === 'summary' ? 'bg-white text-secondary shadow' : 'text-neutral'}`}>Resumo</button>
                        <button onClick={() => setAdminSubView('documents')} className={`px-3 py-1 text-sm font-semibold rounded ${adminSubView === 'documents' ? 'bg-white text-secondary shadow' : 'text-neutral'}`}>Documentos</button>
                        <button onClick={() => setAdminSubView('reports')} className={`px-3 py-1 text-sm font-semibold rounded ${adminSubView === 'reports' ? 'bg-white text-secondary shadow' : 'text-neutral'}`}>Relatórios</button>
                        <button onClick={() => setAdminSubView('export')} className={`px-3 py-1 text-sm font-semibold rounded ${adminSubView === 'export' ? 'bg-white text-secondary shadow' : 'text-neutral'}`}>Exportação API</button>
                    </div>
                </div>
            </div>

            {adminSubView === 'summary' && <AdminDashboard candidates={candidates} />}

            {adminSubView === 'documents' && (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Candidate List */}
                    <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200 self-start">
                         <h3 className="font-bold text-lg text-gray-700 mb-3">Candidatos</h3>
                         <ul className="space-y-2">
                            {candidates.map(candidate => {
                                const status = getOverallStatus(candidate);
                                return (
                                    <li key={candidate.id}>
                                        <button 
                                            onClick={() => setSelectedCandidate(candidate)}
                                            className={`w-full text-left p-3 rounded-md transition-colors ${selectedCandidate?.id === candidate.id ? 'bg-secondary text-white shadow' : 'bg-gray-50 hover:bg-gray-100'}`}
                                        >
                                            <div className="font-semibold">{candidate.name}</div>
                                            <p className={`text-sm ${selectedCandidate?.id === candidate.id ? 'text-gray-200' : 'text-neutral'}`}>{candidate.jobPosition}</p>
                                            <div className="text-sm flex items-center justify-between mt-1">
                                                <span>{candidate.email}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color} ${selectedCandidate?.id === candidate.id ? 'bg-opacity-80 text-white border border-white' : ''}`}>{status.text}</span>
                                            </div>
                                        </button>
                                    </li>
                                )
                            })}
                         </ul>
                    </div>

                    {/* Document View */}
                    <div className="md:col-span-2">
                        {selectedCandidate ? (
                            <>
                                <div className="bg-white p-6 rounded-t-lg border-b-4 border-secondary flex justify-between items-center flex-wrap gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-secondary">Documentos de {selectedCandidate.name}</h3>
                                        <p className="text-md text-neutral font-medium">
                                            {selectedCandidate.jobPosition}
                                        </p>
                                        {selectedCandidate.jobId && (
                                            <p className="text-sm text-neutral font-light mt-1">
                                                ID Vaga: {selectedCandidate.jobId}
                                            </p>
                                        )}
                                        {selectedCandidate.medicalExamDate && <p className="text-sm text-green-700 font-semibold mt-1">Exame agendado para: {selectedCandidate.medicalExamDate}</p>}
                                    </div>
                                    {selectedCandidateStatus?.isComplete && !selectedCandidate.medicalExamDate && (
                                        <button onClick={() => setSchedulingCandidate(selectedCandidate)} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-green-700 transition-colors">
                                            <Calendar className="mr-2"/> Agendar Exame
                                        </button>
                                    )}
                                </div>
                                <DocumentList
                                    documents={selectedCandidate.documents}
                                    viewMode="ADMIN"
                                    onApprove={(docId) => onApprove(selectedCandidate.id, docId)}
                                    onReject={(docId) => onReject(selectedCandidate.id, docId)}
                                />
                            </>
                        ) : (
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center text-neutral h-full flex flex-col justify-center">
                                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400"/>
                                <p className="font-semibold">Nenhum candidato selecionado</p>
                                <p>Selecione um candidato na lista ao lado para começar a validação.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {adminSubView === 'reports' && (
                <ReportsView candidates={candidates} />
            )}
            
            {adminSubView === 'export' && (
                <ApiExportView onImportCandidates={onImportCandidates} />
            )}
        </div>
    );
};