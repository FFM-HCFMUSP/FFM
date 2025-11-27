import React, { useState, useMemo } from 'react';
import { Candidate } from '../types';
import { getOverallStatus } from '../utils/statusUtils';
import { EmailSenderModal } from './EmailSenderModal';
import { Send, Search } from './IconComponents';

interface AdminDashboardProps {
    candidates: Candidate[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ candidates }) => {
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const stats = useMemo(() => {
        const total = candidates.length;
        const completed = candidates.filter(c => getOverallStatus(c).isComplete).length;
        const withRejections = candidates.filter(c => c.documents.some(d => d.status === 'REJECTED')).length;
        const waitingForDocs = candidates.filter(c => getOverallStatus(c).text === 'Aguardando Documentos').length;
        
        return { total, completed, withRejections, waitingForDocs };
    }, [candidates]);
    
    const candidatesAwaitingDocs = useMemo(() => {
        return candidates.filter(c => getOverallStatus(c).text === 'Aguardando Documentos');
    }, [candidates]);

    const filteredCandidates = useMemo(() => {
        const trimmedSearch = searchTerm.trim().toLowerCase();
        if (!trimmedSearch) {
            return candidates;
        }
        
        return candidates.filter(candidate =>
            candidate.jobPosition.toLowerCase().includes(trimmedSearch) ||
            (candidate.jobId && candidate.jobId.toLowerCase().includes(trimmedSearch))
        );
    }, [searchTerm, candidates]);

    const statCards = [
        { title: 'Total de Candidatos', value: stats.total, color: 'border-secondary' },
        { title: 'Processos Completos', value: stats.completed, color: 'border-green-500' },
        { title: 'Aguardando Documentos', value: stats.waitingForDocs, color: 'border-gray-500', action: true },
        { title: 'Com Pendências (Reenviar)', value: stats.withRejections, color: 'border-red-500' },
    ];

    return (
        <>
            {isEmailModalOpen && (
                <EmailSenderModal 
                    candidates={candidatesAwaitingDocs}
                    onClose={() => setIsEmailModalOpen(false)}
                />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map(stat => (
                    <div key={stat.title} className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${stat.color} flex flex-col justify-between`}>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        {stat.action && (
                            <div className="mt-4">
                                <button 
                                    onClick={() => setIsEmailModalOpen(true)}
                                    disabled={stats.waitingForDocs === 0}
                                    className="w-full bg-primary text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center text-sm hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="mr-2 h-4 w-4"/> Notificar Pendentes
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Filter and Results Section */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-700 mb-4">Localizar Status da Vaga</h3>
                <div className="relative mb-4">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar por função ou código da vaga..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-lg pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome do Candidato</th>
                                <th scope="col" className="px-6 py-3">Função</th>
                                <th scope="col" className="px-6 py-3">Código da Vaga</th>
                                <th scope="col" className="px-6 py-3">Status Geral</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCandidates.length > 0 ? (
                                filteredCandidates.map(candidate => {
                                    const status = getOverallStatus(candidate);
                                    return (
                                        <tr key={candidate.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{candidate.name}</td>
                                            <td className="px-6 py-4">{candidate.jobPosition}</td>
                                            <td className="px-6 py-4">{candidate.jobId || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-6 text-neutral">
                                        Nenhum candidato encontrado com os critérios de busca.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};