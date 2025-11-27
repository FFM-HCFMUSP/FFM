import React, { useState, useRef } from 'react';
import { Document, ViewMode } from '../types';
import { CheckCircle, XCircle, Clock, FileWarning, UploadCloud, Paperclip, ChevronDown } from './IconComponents';

interface DocumentListItemProps {
    document: Document;
    viewMode: ViewMode;
    onFileUpload?: (documentId: string, file: File) => void;
    onApprove?: (documentId: string) => void;
    onReject?: (documentId: string) => void;
    onSetNotApplicable?: (documentId: string, isNotApplicable: boolean) => void;
}

const StatusBadge: React.FC<{ status: Document['status'] }> = ({ status }) => {
    const statusMap = {
        PENDING: { text: 'Pendente', icon: <FileWarning />, color: 'bg-gray-100 text-gray-600', },
        ANALYSING: { text: 'Em Análise', icon: <Clock />, color: 'bg-yellow-100 text-yellow-700', },
        APPROVED: { text: 'Aprovado', icon: <CheckCircle />, color: 'bg-green-100 text-green-700', },
        REJECTED: { text: 'Reenviar', icon: <XCircle />, color: 'bg-red-100 text-red-700', },
        NOT_APPLICABLE: { text: 'Não Aplicável', icon: <CheckCircle />, color: 'bg-blue-100 text-blue-700', },
    };
    const current = statusMap[status];
    return (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${current.color}`}>
            {React.cloneElement(current.icon, { className: 'h-4 w-4 mr-1.5' })}
            {current.text}
        </div>
    );
};


export const DocumentListItem: React.FC<DocumentListItemProps> = ({ document, viewMode, onFileUpload, onApprove, onReject, onSetNotApplicable }) => {
    const [isExpanded, setIsExpanded] = useState(document.status === 'REJECTED');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onFileUpload) {
            onFileUpload(document.id, file);
        }
    };

    const handleNotApplicableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSetNotApplicable) {
            onSetNotApplicable(document.id, e.target.checked);
        }
    };
    
    const canUpload = viewMode === 'CANDIDATE' && (document.status === 'PENDING' || document.status === 'REJECTED');
    const isNotApplicable = document.status === 'NOT_APPLICABLE';

    return (
        <li className="p-4 md:p-6 hover:bg-light-bg transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1 mb-4 md:mb-0">
                    <p className="font-bold text-gray-800">{document.name}</p>
                    {document.optional && viewMode === 'CANDIDATE' && (
                        <label className="flex items-center mt-2 text-sm text-neutral cursor-pointer w-fit">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={isNotApplicable}
                                onChange={handleNotApplicableChange}
                            />
                            <span className="ml-2">Não se aplica</span>
                        </label>
                    )}
                    <p className="text-sm text-neutral mt-1">Última atualização: {document.lastUpdated}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <StatusBadge status={document.status} />
                    {canUpload && (
                         <>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg"/>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isNotApplicable}
                                className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-opacity-90 disabled:bg-gray-400"
                            >
                                <UploadCloud className="h-5 w-5 mr-2" />
                                Enviar
                            </button>
                        </>
                    )}
                    {(document.status !== 'PENDING' || viewMode === 'ADMIN') && (
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-full hover:bg-gray-200">
                           <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
            </div>
            
            {isExpanded && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    {document.status === 'REJECTED' && (
                        <div className="mb-3 p-3 bg-red-50 text-red-800 border-l-4 border-red-400 rounded">
                           <p className="font-semibold">Motivo da Pendência:</p>
                           <p>{document.rejectionReason}</p>
                        </div>
                    )}
                    
                    {document.fileName && (
                        <div className="flex items-center text-sm text-secondary font-semibold mb-3">
                            <Paperclip className="h-4 w-4 mr-2"/>
                            <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {document.fileName}
                            </a>
                        </div>
                    )}

                    {document.extractedData && (
                        <div className="mb-3">
                            <h4 className="font-semibold text-sm text-gray-600 mb-1">Dados Extraídos (OCR):</h4>
                            <div className="text-sm text-gray-800 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                               {Object.keys(document.extractedData).length > 0 ? (
                                   <pre className="whitespace-pre-wrap"><code>{JSON.stringify(document.extractedData, null, 2)}</code></pre>
                               ) : <p className="text-neutral">Nenhum dado extraído.</p>}
                            </div>
                        </div>
                    )}

                    {viewMode === 'ADMIN' && document.status !== 'PENDING' && document.status !== 'NOT_APPLICABLE' && (
                        <div className="flex items-center justify-end space-x-3 mt-4">
                            <button
                                onClick={() => onReject?.(document.id)}
                                disabled={document.status === 'REJECTED'}
                                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-red-700 disabled:bg-gray-400"
                            >
                                <XCircle className="h-5 w-5 mr-2" />
                                Rejeitar
                            </button>
                             <button
                                onClick={() => onApprove?.(document.id)}
                                disabled={document.status === 'APPROVED'}
                                className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-green-700 disabled:bg-gray-400"
                            >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Aprovar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </li>
    );
};
