import React from 'react';
import { Building } from './IconComponents';
import { Document } from '../types';

interface EmailTemplateProps {
    candidateName: string;
    pendingDocuments: Document[];
    jobPosition: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ candidateName, pendingDocuments, jobPosition }) => {
    return (
        <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#333', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#28724F', color: 'white', padding: '24px' }}>
                <table width="100%" cellSpacing="0" cellPadding="0">
                    <tbody>
                        <tr>
                            <td style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ backgroundColor: 'white', borderRadius: '6px', padding: '8px', marginRight: '16px' }}>
                                    <Building style={{ height: '28px', width: '28px', color: '#28724F' }} />
                                </div>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Fundação Faculdade de Medicina</h1>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0' }}>Portal de Admissão de Candidatos</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Body */}
            <div style={{ padding: '24px', lineHeight: 1.6 }}>
                <h2 style={{ color: '#28724F', fontSize: '18px', margin: '0 0 16px 0' }}>Parabéns pela sua aprovação, {candidateName}!</h2>
                <p style={{ margin: '0 0 16px 0' }}>Estamos muito felizes em avançar com você no processo de admissão para a vaga de <strong>{jobPosition}</strong>.</p>
                <p style={{ margin: '0 0 16px 0' }}>O próximo passo é o envio dos seus documentos. Por favor, acesse o nosso portal para fazer o upload dos itens listados abaixo:</p>
                
                <ul style={{ listStyle: 'none', padding: '0', margin: '0 0 24px 0', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    {pendingDocuments.map((doc, index) => (
                        <li key={doc.id} style={{ padding: '12px 16px', borderBottom: index === pendingDocuments.length - 1 ? 'none' : '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                            - {doc.name}
                        </li>
                    ))}
                </ul>

                <table width="100%" cellSpacing="0" cellPadding="0">
                    <tbody>
                        <tr>
                            <td align="center">
                                <a 
                                    href="#" 
                                    target="_blank" 
                                    style={{ 
                                        display: 'inline-block',
                                        backgroundColor: '#426DA9', 
                                        color: 'white', 
                                        padding: '12px 24px', 
                                        borderRadius: '6px', 
                                        textDecoration: 'none', 
                                        fontWeight: 'bold' 
                                    }}
                                >
                                    Acessar Portal de Admissão
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <p style={{ marginTop: '24px', fontSize: '14px', color: '#75787B' }}>
                    Se tiver qualquer dúvida, não hesite em nos contatar.
                </p>
                <p style={{ fontSize: '14px', color: '#75787B', margin: 0 }}>
                    Atenciosamente,
                    <br />
                    <strong>Equipe de Admissão FFM</strong>
                </p>
            </div>
             {/* Footer */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '16px', textAlign: 'center', fontSize: '12px', color: '#75787B', borderTop: '1px solid #e2e8f0'}}>
                © {new Date().getFullYear()} Fundação Faculdade de Medicina. Todos os direitos reservados.
            </div>
        </div>
    );
};