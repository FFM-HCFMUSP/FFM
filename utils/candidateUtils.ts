import { Document } from '../types';

export const createDefaultDocumentList = (): Document[] => {
    const now = new Date().toLocaleString('pt-BR');
    return [
        { id: 'doc_id_frente', name: 'Cédula de identidade - Frente', status: 'PENDING', lastUpdated: now },
        { id: 'doc_id_verso', name: 'Cédula de identidade - Verso', status: 'PENDING', lastUpdated: now },
        { id: 'doc_cpf_frente', name: 'CPF - Frente', status: 'PENDING', lastUpdated: now },
        { id: 'doc_cpf_verso', name: 'CPF - Verso', status: 'PENDING', lastUpdated: now },
        { id: 'doc_titulo_frente', name: 'Título de Eleitor - Frente', status: 'PENDING', lastUpdated: now },
        { id: 'doc_titulo_verso', name: 'Título de Eleitor - Verso', status: 'PENDING', lastUpdated: now },
        { id: 'doc_formacao_frente', name: 'Formação (conforme requisito do Cargo) - Frente', status: 'PENDING', lastUpdated: now },
        { id: 'doc_formacao_verso', name: 'Formação (conforme requisito do Cargo) - Verso', status: 'PENDING', lastUpdated: now },
        { id: 'doc_residencia', name: 'Comprovante de Residência', status: 'PENDING', lastUpdated: now },
        { id: 'doc_vacinacao', name: 'Carteira de Vacinação (exceto colaboradores ICESP)', status: 'PENDING', lastUpdated: now },
        { id: 'doc_ctps_foto', name: 'CTPS - Página da Foto', status: 'PENDING', lastUpdated: now },
        { id: 'doc_ctps_civil', name: 'CTPS - Página da Qualificação Civil', status: 'PENDING', lastUpdated: now },
        { id: 'doc_ctps_vinculo', name: 'CTPS – último vínculo ou atual ativo que for conciliar', status: 'PENDING', lastUpdated: now },
        { id: 'doc_pis', name: 'Cartão do PIS / PASEP ou Extrato de PIS ATIVO', status: 'PENDING', lastUpdated: now },
        { id: 'doc_certidao', name: 'Certidão de Nascimento (SOLTEIROS) ou Casamento (CASADOS)', status: 'PENDING', lastUpdated: now },
        { id: 'doc_militar', name: 'Certificado Militar', status: 'PENDING', lastUpdated: now, optional: true },
        { id: 'doc_conselho', name: 'Carteira do Conselho Regional (atual)', status: 'PENDING', lastUpdated: now, optional: true },
        { id: 'doc_outro_vinculo', name: 'Declaração de outro vínculo Trabalhista', status: 'PENDING', lastUpdated: now, optional: true },
    ];
};
