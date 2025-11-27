import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Key, Server, Lock, Download, XCircle, X, Save } from './IconComponents';
import { exportData } from '../utils/exportUtils';

// --- Mock API and Data ---
interface MockCandidate {
    id: string;
    name: string;
    email: string;
    status: 'Aprovado' | 'Reprovado' | 'Em processo';
    processDate: string; // YYYY-MM-DD
    jobPosition: string;
    jobId: string;
    unit: string;
    [key: string]: any; // Index signature
}

// Generate a larger, more realistic dataset for testing
const generateMockData = (): MockCandidate[] => {
    const names = ["Gabriel", "Sophia", "Arthur", "Alice", "Davi", "Julia", "Pedro", "Isabella", "Enzo", "Manuela"];
    const surnames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes"];
    const jobs = ["Enfermeiro(a)", "Técnico(a) de Enfermagem", "Analista Administrativo", "Fisioterapeuta", "Médico(a)"];
    const units = ["Unidade Central", "Bloco Cirúrgico", "UTI Neonatal", "Ambulatório"];
    const statuses: MockCandidate['status'][] = ['Aprovado', 'Reprovado', 'Em processo'];
    
    const data: MockCandidate[] = [];
    for (let i = 0; i < 150; i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const surname = surnames[Math.floor(Math.random() * surnames.length)];
        const processDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const jobPosition = jobs[Math.floor(Math.random() * jobs.length)];
        
        const vCode = `v${Math.floor(2770000 + Math.random() * 2000)}`;

        data.push({
            id: `api_cand_${i + 1}`,
            name: `${name} ${surname}`,
            email: `${name.toLowerCase()}.${surname.toLowerCase()}${i}@email.com`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            processDate: processDate,
            jobPosition: jobPosition,
            jobId: vCode,
            unit: units[Math.floor(Math.random() * units.length)],
        });
    }
    return data;
};

const allMockCandidates = generateMockData();

// This service simulates the API calls as described in the documentation.
const apiService = {
    getToken: async (tokenUrl: string, clientId: string, clientSecret: string): Promise<{ access_token: string; expires_in: number; token_type: string; }> => {
        console.log("LOG: Iniciando autenticação (simulado)...");
        console.log("LOG: URL do Token:", tokenUrl);

        await new Promise(res => setTimeout(res, 500)); // Simulate network delay
        
        const basicAuthHeader = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
        console.log("LOG: Cabeçalho de Auticação (simulado):", basicAuthHeader);

        const body = new URLSearchParams();
        body.append('grant_type', 'client_credentials');
        console.log("LOG: Corpo da Requisição (simulado):", body.toString());
        
        if (clientId && clientSecret) {
            console.log("LOG: Autenticação bem-sucedida (simulado).");
            return { access_token: `mock_token_${Date.now()}`, expires_in: 2591999, token_type: "Bearer" };
        }
        
        console.error("LOG: Falha na autenticação (simulado).");
        throw new Error("Credenciais inválidas ou falha na conexão.");
    },
    fetchCandidates: async (baseUrl: string, token: string, filters: any): Promise<{ candidates: MockCandidate[], total: number }> => {
        const { export_date_start, export_date_end, status, searchString, page, per_page } = filters;
        
        const queryParams = new URLSearchParams({
            export_date_start,
            export_date_end,
            page: page.toString(),
            per_page: per_page.toString(),
        }).toString();
        
        console.log(`LOG: Buscando candidatos (simulado) em ${baseUrl} com query: ?${queryParams}`);
        console.log(`LOG: Usando Token Bearer (simulado): Bearer ${token.substring(0,15)}...`);

        await new Promise(res => setTimeout(res, 1000));

        if (!token) {
            throw new Error("Token de acesso inválido ou expirado.");
        }

        let results = allMockCandidates.filter(c => 
            c.processDate >= export_date_start && c.processDate <= export_date_end
        );
        
        if (status && status !== 'Todos') {
            results = results.filter(c => c.status === status);
        }
        if (searchString) {
            const lowerSearch = searchString.toLowerCase();
            results = results.filter(c => 
                c.jobPosition.toLowerCase().includes(lowerSearch) || 
                c.unit.toLowerCase().includes(lowerSearch)
            );
        }

        const total = results.length;
        const startIndex = (page - 1) * per_page;
        const paginatedCandidates = results.slice(startIndex, startIndex + per_page);

        console.log(`LOG: Consulta (simulada) retornou ${paginatedCandidates.length} de ${total} candidatos filtrados.`);
        return { candidates: paginatedCandidates, total: total };
    }
};
// --- End Mock API ---

const API_CREDENTIALS_KEY = 'ffm_api_credentials';
const today = new Date().toISOString().split('T')[0];
const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];

const EXPORT_HEADERS = [
    { key: 'jobId', label: 'ID da Vaga' },
    { key: 'name', label: 'Nome Completo' },
    { key: 'email', label: 'E-mail' },
    { key: 'status', label: 'Status' },
    { key: 'processDate', label: 'Data do Processo' },
    { key: 'jobPosition', label: 'Vaga' },
    { key: 'unit', label: 'Unidade' }
];

interface ApiExportViewProps {
    onImportCandidates: (candidates: MockCandidate[]) => void;
}

export const ApiExportView: React.FC<ApiExportViewProps> = ({ onImportCandidates }) => {
    const [credentials, setCredentials] = useState(() => {
        const defaults = {
            baseUrl: 'https://api.vagas.com.br/v1',
            tokenUrl: 'https://apigateway.vagas.com.br/oauth/token',
            clientId: '',
            clientSecret: ''
        };
        try {
            const saved = localStorage.getItem(API_CREDENTIALS_KEY);
            const savedParsed = saved ? JSON.parse(saved) : {};
            return { ...defaults, ...savedParsed };
        } catch (error) {
            console.error("Failed to parse API credentials from localStorage", error);
            return defaults;
        }
    });

    const tokenRef = useRef<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    
    const [filters, setFilters] = useState({ startDate: oneMonthAgo, endDate: today, status: 'Todos', searchString: '' });
    const [results, setResults] = useState<MockCandidate[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    const [isLoading, setIsLoading] = useState<'auth' | 'query' | false>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<MockCandidate | null>(null);
    const [selectedIds, setSelectedIds] = useState(new Set<string>());
    const itemsPerPage = 10;
    
    useEffect(() => {
        try {
            localStorage.setItem(API_CREDENTIALS_KEY, JSON.stringify(credentials));
        } catch (error) {
            console.error("Failed to save API credentials to localStorage", error);
        }
    }, [credentials]);

    const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleConnect = async () => {
        setIsLoading('auth');
        setError(null);
        try {
            const tokenResponse = await apiService.getToken(credentials.tokenUrl, credentials.clientId, credentials.clientSecret);
            if (tokenResponse && tokenResponse.access_token) {
                tokenRef.current = tokenResponse.access_token;
                setIsConnected(true);
            } else {
                throw new Error("Credenciais inválidas ou falha na conexão.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleQuery = useCallback(async (page = 1) => {
        if (!tokenRef.current) {
            setError("Não conectado. Por favor, insira as credenciais e conecte-se primeiro.");
            return;
        }
        setIsLoading('query');
        setError(null);
        setCurrentPage(page);
        setSelectedIds(new Set()); // Clear selection on new query
        
        try {
            const apiFilters = {
                export_date_start: filters.startDate,
                export_date_end: filters.endDate,
                status: filters.status,
                searchString: filters.searchString,
                page,
                per_page: itemsPerPage,
            };
            const response = await apiService.fetchCandidates(credentials.baseUrl, tokenRef.current, apiFilters);
            setResults(response.candidates);
            setTotalCount(response.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao buscar os dados.');
            setResults([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    }, [filters, credentials.baseUrl]);

    const handleSelect = (candidateId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(candidateId)) {
                newSet.delete(candidateId);
            } else {
                newSet.add(candidateId);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(results.map(c => c.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSave = () => {
        const candidatesToSave = results.filter(c => selectedIds.has(c.id));
        onImportCandidates(candidatesToSave);
        setSelectedIds(new Set()); // Clear selection after saving
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const isAllSelected = results.length > 0 && selectedIds.size === results.length;

    return (
        <div className="space-y-6">
            {/* Credentials Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-700 mb-4">Configuração da API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" name="baseUrl" placeholder="Base URL" value={credentials.baseUrl} onChange={handleCredentialChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" disabled={isConnected}/>
                    </div>
                     <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" name="tokenUrl" placeholder="Token URL" value={credentials.tokenUrl} onChange={handleCredentialChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" disabled={isConnected}/>
                    </div>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="password" name="clientId" placeholder="Client ID" value={credentials.clientId} onChange={handleCredentialChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" disabled={isConnected}/>
                    </div>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="password" name="clientSecret" placeholder="Client Secret" value={credentials.clientSecret} onChange={handleCredentialChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md" disabled={isConnected}/>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                    {isConnected ? (
                        <p className="text-green-600 font-semibold">Conectado com sucesso!</p>
                    ) : (
                         <button onClick={handleConnect} disabled={isLoading === 'auth'} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-opacity-90 disabled:bg-gray-400">
                            {isLoading === 'auth' ? 'Conectando...' : 'Conectar'}
                        </button>
                    )}
                </div>
                 {error && !isConnected && <p className="text-red-600 mt-2 text-sm">{error}</p>}
            </div>

            {/* Filter and Query Section */}
            {isConnected && (
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data Inicial</label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data Final</label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md">
                                <option>Todos</option>
                                <option>Aprovado</option>
                                <option>Reprovado</option>
                                <option>Em processo</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Vaga ou Unidade</label>
                            <input type="text" name="searchString" placeholder="Filtrar por vaga/unidade..." value={filters.searchString} onChange={handleFilterChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                    </div>
                     <div className="mt-4">
                        <button onClick={() => handleQuery(1)} disabled={isLoading === 'query'} className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-opacity-90 disabled:bg-gray-400">
                            {isLoading === 'query' ? 'Consultando...' : 'Consultar Candidatos'}
                        </button>
                    </div>
                 </div>
            )}
            
            {/* Results Table Section */}
            {isConnected && (results.length > 0 || isLoading === 'query') && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                        <h3 className="font-bold text-lg text-gray-700">Resultados da Consulta ({totalCount} encontrados)</h3>
                        <div className="flex items-center space-x-2">
                           <button onClick={() => exportData('csv', results.filter(c => selectedIds.has(c.id)), EXPORT_HEADERS)} disabled={selectedIds.size === 0} className="bg-gray-600 text-white font-bold py-2 px-3 text-sm rounded-lg flex items-center hover:bg-opacity-90 disabled:bg-gray-400">
                               <Download className="mr-2 h-4 w-4" /> Exportar CSV ({selectedIds.size})
                           </button>
                            <button onClick={handleSave} disabled={selectedIds.size === 0} className="bg-green-600 text-white font-bold py-2 px-3 text-sm rounded-lg flex items-center hover:bg-green-700 disabled:bg-gray-400">
                                <Save className="mr-2 h-4 w-4" /> Importar para Admissão ({selectedIds.size})
                            </button>
                        </div>
                    </div>

                    {isLoading === 'query' ? (
                         <div className="text-center py-10">
                            <p className="text-neutral">Carregando resultados...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="p-4">
                                            <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"/>
                                        </th>
                                        {EXPORT_HEADERS.map(h => <th key={h.key} scope="col" className="px-6 py-3">{h.label}</th>)}
                                        <th scope="col" className="px-6 py-3"><span className="sr-only">Ações</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map(candidate => (
                                        <tr key={candidate.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="w-4 p-4">
                                                 <input type="checkbox" checked={selectedIds.has(candidate.id)} onChange={() => handleSelect(candidate.id)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"/>
                                            </td>
                                            {EXPORT_HEADERS.map(h => 
                                                <td key={`${candidate.id}-${h.key}`} className="px-6 py-4">
                                                    {candidate[h.key]}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setIsDetailsModalOpen(candidate)} className="font-medium text-secondary hover:underline">Ver Detalhes</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                     {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 text-sm text-neutral">
                            <p>Página {currentPage} de {totalPages}</p>
                            <div className="flex space-x-2">
                                <button onClick={() => handleQuery(currentPage - 1)} disabled={currentPage === 1 || isLoading === 'query'} className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50">Anterior</button>
                                <button onClick={() => handleQuery(currentPage + 1)} disabled={currentPage === totalPages || isLoading === 'query'} className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50">Próximo</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
             {error && isConnected && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
                    <XCircle className="h-5 w-5 mr-3"/>
                    <p>{error}</p>
                </div>
            )}
             {isDetailsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                         <button onClick={() => setIsDetailsModalOpen(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                        <h3 className="text-lg font-bold text-secondary mb-4">Detalhes do Candidato</h3>
                         <div className="space-y-2 text-sm">
                            {EXPORT_HEADERS.map(h => (
                                <div key={h.key} className="flex">
                                    <p className="w-1/3 font-semibold text-gray-600">{h.label}:</p>
                                    <div className="w-2/3 text-gray-800">
                                        {isDetailsModalOpen[h.key]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};