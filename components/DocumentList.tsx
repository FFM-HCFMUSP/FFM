import React from 'react';
import { Document, ViewMode } from '../types';
import { DocumentListItem } from './DocumentListItem';

interface DocumentListProps {
    documents: Document[];
    viewMode: ViewMode;
    onFileUpload?: (documentId: string, file: File) => void;
    onApprove?: (documentId: string) => void;
    onReject?: (documentId: string) => void;
    onSetNotApplicable?: (documentId: string, isNotApplicable: boolean) => void;
}

export const DocumentList: React.FC<DocumentListProps> = (props) => {
    return (
        <div className="bg-white rounded-b-lg shadow-sm border-x border-b border-gray-200">
            <ul className="divide-y divide-gray-200">
                {props.documents.map(doc => (
                    <DocumentListItem key={doc.id} document={doc} {...props} />
                ))}
            </ul>
        </div>
    );
};
