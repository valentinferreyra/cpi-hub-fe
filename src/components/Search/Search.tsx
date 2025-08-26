import React, { useState } from 'react';
import './Search.css';

interface SearchProps {
  placeholder?: string;
  className?: string;
}

const Search: React.FC<SearchProps> = ({ 
  placeholder = "Buscar un tópico...",
  className = "" 
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    console.log('Search input changed:', value);
  };

  const handleInputClick = () => {
    console.log('Search input clicked');
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      className={`search-input ${className}`}
      value={searchValue}
      onChange={handleInputChange}
      onClick={handleInputClick}
    />
  );
};

export default Search;
