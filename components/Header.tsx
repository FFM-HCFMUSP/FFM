import React from 'react';
import { Building } from './IconComponents';

export const Header: React.FC = () => {
    return (
        <header className="bg-primary shadow-md">
            <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-white text-primary p-2 rounded-md mr-4">
                        <Building className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">Fundação Faculdade de Medicina</h1>
                        <p className="text-sm md:text-md text-gray-200">Portal de Admissão de Candidatos</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
