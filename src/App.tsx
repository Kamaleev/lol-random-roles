import 'normalize.css';
import React, { useState, useEffect } from 'react';
import './App.css';

// Типы и интерфейсы
type Role = 'adc' | 'jungle' | 'top' | 'support' | 'mid';

interface Player {
  id: number;
  name: string;
}

interface SelectedRoles {
  [playerId: number]: Role[];
}

interface AssignedRoles {
  [playerId: number]: Role;
}

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showNameInput, setShowNameInput] = useState<boolean>(true);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '', '']);
  const [selectedRoles, setSelectedRoles] = useState<SelectedRoles>({});
  const [assignedRoles, setAssignedRoles] = useState<AssignedRoles>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [randomNumber] = useState(() => Math.random());

  // Роли в игре
  const roles: Role[] = ['adc', 'jungle', 'top', 'support', 'mid'];


  // Инициализация игроков
  const initializePlayers = (names: string[]): void => {
    const playersList: Player[] = names.map((name, index) => ({
      id: index,
      name: name.trim(),
    }));
    setPlayers(playersList);
    
    // Инициализация выбранных ролей для каждого игрока
    const initialRoles: SelectedRoles = {};
    playersList.forEach(player => {
      initialRoles[player.id] = [];
    });
    setSelectedRoles(initialRoles);
  };

  // Загрузка ников из localStorage при монтировании
  useEffect(() => {
    const savedNames = localStorage.getItem('playerNames');
    if (savedNames) {
      try {
        const names: string[] = JSON.parse(savedNames);
        if (Array.isArray(names) && names.length === 5) {
          setPlayerNames(names);
          // Если есть сохраненные ники, сразу показываем основной интерфейс
          if (names.every(name => name.trim() !== '')) {
            initializePlayers(names);
            setShowNameInput(false);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки ников:', error);
      }
    }
  }, []);

  // Сохранение ников и переход к выбору ролей
  const handleNamesSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (playerNames.every(name => name.trim() !== '')) {
      localStorage.setItem('playerNames', JSON.stringify(playerNames));
      initializePlayers(playerNames);
      setShowNameInput(false);
    } else {
      alert('Пожалуйста, введите все ники игроков');
    }
  };

  // Обновление ника игрока
  const handleNameChange = (index: number, value: string): void => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  // Переключение роли для игрока
  const toggleRole = (playerId: number, role: Role): void => {
    setSelectedRoles(prev => {
      const playerRoles = [...(prev[playerId] || [])];
      const roleIndex = playerRoles.indexOf(role);
      
      if (roleIndex === -1) {
        // Добавляем роль, если еще не выбрана
        playerRoles.push(role);
      } else {
        // Удаляем роль, если уже выбрана
        playerRoles.splice(roleIndex, 1);
      }
      
      return {
        ...prev,
        [playerId]: playerRoles
      };
    });
  };

  // Проверка, может ли игрок получить определенную роль
  const canPlayerTakeRole = (playerId: number, role: Role): boolean => {
    const playerRoles = selectedRoles[playerId] || [];
    return playerRoles.includes(role);
  };

  // Алгоритм рандомного распределения ролей
  const randomizeRoles = (): boolean => {
    // Проверяем, что у каждого игрока выбрана хотя бы одна роль
    for (const player of players) {
      if (!selectedRoles[player.id] || selectedRoles[player.id].length === 0) {
        alert(`Игрок ${player.name} должен выбрать хотя бы одну роль`);
        return false;
      }
    }

    let attempts = 0;
    const maxAttempts = 1000;

    while (attempts < maxAttempts) {
      const availableRoles: Role[] = [...roles];
      const assignments: AssignedRoles = {};
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

      let success = true;

      for (const player of shuffledPlayers) {
        const possibleRoles = availableRoles.filter(role => 
          canPlayerTakeRole(player.id, role)
        );

        if (possibleRoles.length === 0) {
          success = false;
          break;
        }

        const randomIndex = Math.floor(randomNumber * possibleRoles.length);
        const assignedRole = possibleRoles[randomIndex];
        
        assignments[player.id] = assignedRole;
        const roleIndex = availableRoles.indexOf(assignedRole);
        availableRoles.splice(roleIndex, 1);
      }

      if (success) {
        setAssignedRoles(assignments);
        setShowResults(true);
        return true;
      }

      attempts++;
    }

    alert('Не удалось распределить роли. Попробуйте выбрать больше ролей для каждого игрока.');
    return false;
  };

  // Сброс к вводу имен
  const resetNames = (): void => {
    localStorage.removeItem('playerNames');
    setPlayerNames(['', '', '', '', '']);
    setShowNameInput(true);
    setShowResults(false);
    setAssignedRoles({});
  };

  // Новая рандомизация
  const rerandomize = (): void => {
    randomizeRoles();
  };

  // Возврат к выбору ролей
  const backToRoleSelection = (): void => {
    setShowResults(false);
  };

  // Получение цвета для роли
  const getRoleColor = (role: Role): string => {
    const colors: Record<Role, string> = {
      adc: '#ff4d4d',
      jungle: '#4caf50',
      top: '#ff9800',
      support: '#9c27b0',
      mid: '#2196f3'
    };
    return colors[role];
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>League of Legends - Определение ролей</h1>
      </header>

      <main className="App-main">
        {showNameInput ? (
          <div className="name-input-container">
            <h2>Введите ники игроков</h2>
            <form onSubmit={handleNamesSubmit}>
              {playerNames.map((name, index) => (
                <div key={index} className="name-input-group">
                  <label htmlFor={`player-${index}`}>Игрок {index + 1}:</label>
                  <input
                    id={`player-${index}`}
                    type="text"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleNameChange(index, e.target.value)
                    }
                    placeholder={`Ник игрока ${index + 1}`}
                    required
                  />
                </div>
              ))}
              <button type="submit" className="submit-button">
                Далее
              </button>
            </form>
          </div>
        ) : (
          <div className="role-selection-container">
            {!showResults ? (
              <>
                <div className="players-section">
                  <h2>Выберите предпочитаемые роли</h2>
                  <button onClick={resetNames} className="reset-names-button">
                    Изменить ники
                  </button>
                  
                  {players.map(player => (
                    <div key={player.id} className="player-card">
                      <h3>{player.name}</h3>
                      <div className="roles-buttons">
                        {roles.map(role => (
                          <button
                            key={role}
                            onClick={() => toggleRole(player.id, role)}
                            className={`role-button ${
                              selectedRoles[player.id]?.includes(role) ? 'selected' : ''
                            }`}
                            style={{
                              borderColor: selectedRoles[player.id]?.includes(role) 
                                ? getRoleColor(role) 
                                : undefined
                            }}
                          >
                            {role.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <div className="selected-count">
                        Выбрано: {selectedRoles[player.id]?.length || 0} из 5
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={randomizeRoles} 
                  className="randomize-button"
                  disabled={players.some(p => !selectedRoles[p.id]?.length)}
                >
                  Рандом
                </button>
              </>
            ) : (
              <div className="results-section">
                <h2>Результаты распределения</h2>
                <div className="results-actions">
                  <button onClick={backToRoleSelection} className="back-button">
                    Назад к выбору ролей
                  </button>
                  <button onClick={rerandomize} className="rerandomize-button">
                    Перемешать
                  </button>
                </div>
                
                <div className="results-grid">
                  {players.map(player => (
                    <div key={player.id} className="result-card">
                      <div className="player-name">{player.name}</div>
                      <div 
                        className="assigned-role"
                        style={{ 
                          color: getRoleColor(assignedRoles[player.id]),
                          textShadow: `0 0 10px ${getRoleColor(assignedRoles[player.id])}80`
                        }}
                      >
                        {assignedRoles[player.id]?.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;