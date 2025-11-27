import React, { useState, useMemo } from 'react';
import { Candidate, Document } from '../types';
import { EmailTemplate } from './EmailTemplate';
import { sendEmail } from '../services/emailService';
import { X, Send, UserCheck, Building } from './IconComponents';

type Environment = 'DEVELOPMENT' | 'PRODUCTION';

interface EmailSenderModalProps {
    candidates: Candidate[];
    onClose: () => void;
}

export const EmailSenderModal: React.FC<EmailSenderModalProps> = ({ candidates, onClose }) => {
    const [environment, setEnvironment] = useState<Environment>('DEVELOPMENT');
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    const devEmail = 'michelel@ffm.br';
    const previewCandidate = candidates[0];
    
    const pendingDocumentsForPreview = useMemo(() => {
        if (!previewCandidate) return [];
        return previewCandidate.documents.filter(doc => doc.status === 'PENDING' || doc.status === 'REJECTED');
    }, [previewCandidate]);

    const generateEmailBody = (candidate: Candidate, pendingDocs: Document[]): string => {
        // This is a simplified text version for the email service log.
        // In a real app, you would send HTML.
        let body = `Olá, ${candidate.name}!\n\n`;
        body += `Parabéns pela sua aprovação para a vaga de ${candidate.jobPosition}.\n`;
        body += `Por favor, envie os seguintes documentos pendentes através do nosso portal:\n`;
        pendingDocs.forEach(doc => {
            body += `- ${doc.name}\n`;
        });
        body += `\nAtenciosamente,\nEquipe de Admissão FFM`;
        return body;
    };

    const handleSendEmails = async () => {
        setIsSending(true);
        const subject = "Documentação para Admissão - Fundação Faculdade de Medicina";
        
        for (const candidate of candidates) {
            const pendingDocs = candidate.documents.filter(doc => doc.status === 'PENDING' || doc.status === 'REJECTED');
            if (pendingDocs.length === 0) continue;

            const payload = {
                to: environment === 'PRODUCTION' ? candidate.email : devEmail,
                subject: subject,
                body: generateEmailBody(candidate, pendingDocs),
            };
            await sendEmail(payload);
        }
        
        setIsSending(false);
        setSendSuccess(true);
    };

    if (sendSuccess) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 text-center">
                    <div className="bg-green-100 text-green-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                        <Send className="h-8 w-8"/>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">E-mails Enviados!</h2>
                    <p className="text-neutral mb-6">
                        {candidates.length} e-mail(s) foram processados e enviados com sucesso.
                        {environment === 'DEVELOPMENT' && ` (Todos para ${devEmail})`}
                    </p>
                    <button onClick={onClose} className="bg-primary text-white font-bold py-2 px-6 rounded-lg w-full hover:bg-opacity-90">
                        Fechar
                    </button>
                </div>
            </div>
        )
    }

    if (!previewCandidate) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-secondary">Notificar Candidatos Pendentes</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">1. Selecione o Ambiente de Envio</h3>
                             <div className="flex p-1 bg-gray-200 rounded-lg">
                                <button onClick={() => setEnvironment('DEVELOPMENT')} className={`w-full py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center transition-colors ${environment === 'DEVELOPMENT' ? 'bg-white text-primary shadow' : 'bg-transparent text-neutral'}`}>
                                    <Building className="h-5 w-5 mr-2"/> Desenvolvimento
                                </button>
                                <button onClick={() => setEnvironment('PRODUCTION')} className={`w-full py-2 px-4 rounded-md text-sm font-bold flex items-center justify-center transition-colors ${environment === 'PRODUCTION' ? 'bg-white text-secondary shadow' : 'bg-transparent text-neutral'}`}>
                                    <UserCheck className="h-5 w-5 mr-2"/> Produção
                                </button>
                            </div>
                            <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 rounded-r text-sm">
                                {environment === 'DEVELOPMENT' 
                                    ? <p><strong>Atenção:</strong> Todos os e-mails serão enviados para <strong>{devEmail}</strong> para fins de teste.</p>
                                    : <p><strong>Atenção:</strong> Os e-mails serão enviados para os endereços reais dos candidatos.</p>
                                }
                            </div>
                        </div>
                        <div>
                             <h3 className="font-bold text-gray-700 mb-2">2. Resumo do Envio</h3>
                             <div className="bg-gray-50 p-4 rounded-lg border text-sm space-y-2">
                                 <p><strong>Total de e-mails a serem enviados:</strong> {candidates.length}</p>
                                 <p><strong>Assunto:</strong> Documentação para Admissão - Fundação Faculdade de Medicina</p>
                             </div>
                        </div>
                    </div>
                    {/* Preview */}
                    <div>
                        <h3 className="font-bold text-gray-700 mb-2">3. Pré-visualização do E-mail</h3>
                         <div className="border rounded-lg overflow-hidden">
                             <EmailTemplate 
                                candidateName={previewCandidate.name} 
                                pendingDocuments={pendingDocumentsForPreview}
                                jobPosition={previewCandidate.jobPosition}
                            />
                         </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSendEmails} disabled={isSending} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors flex items-center disabled:bg-gray-400">
                        <Send className="h-5 w-5 mr-2" />
                        {isSending ? `Enviando ${candidates.length} e-mails...` : `Enviar ${candidates.length} e-mails`}
                    </button>
                </div>
            </div>
        </div>
    );
};