import 'normalize.css';
import './App.css'
import React, { useState, useEffect } from 'react';

function App() {
  const [players, setPlayers] = useState([]);
  const [showNameInput, setShowNameInput] = useState(true);
  const [playerNames, setPlayerNames] = useState(['', '', '', '', '']);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [assignedRoles, setAssignedRoles] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Роли в игре
  const roles = ['adc', 'jungle', 'top', 'support', 'mid'];

  // Загрузка ников из localStorage при монтировании
  useEffect(() => {
    const savedNames = localStorage.getItem('playerNames');
    if (savedNames) {
      const names = JSON.parse(savedNames);
      setPlayerNames(names);
      // Если есть сохраненные ники, сразу показываем основной интерфейс
      if (names.every(name => name.trim() !== '')) {
        initializePlayers(names);
        setShowNameInput(false);
      }
    }
  }, []);

  // Инициализация игроков
  const initializePlayers = (names) => {
    const playersList = names.map((name, index) => ({
      id: index,
      name: name,
    }));
    setPlayers(playersList);
    
    // Инициализация выбранных ролей для каждого игрока
    const initialRoles = {};
    playersList.forEach(player => {
      initialRoles[player.id] = [];
    });
    setSelectedRoles(initialRoles);
  };

  // Сохранение ников и переход к выбору ролей
  const handleNamesSubmit = (e) => {
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
  const handleNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  // Переключение роли для игрока
  const toggleRole = (playerId, role) => {
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
  const canPlayerTakeRole = (playerId, role, assignments) => {
    const playerRoles = selectedRoles[playerId] || [];
    return playerRoles.includes(role);
  };

  // Алгоритм рандомного распределения ролей
  const randomizeRoles = () => {
    // Проверяем, что у каждого игрока выбрана хотя бы одна роль
    for (let player of players) {
      if (!selectedRoles[player.id] || selectedRoles[player.id].length === 0) {
        alert(`Игрок ${player.name} должен выбрать хотя бы одну роль`);
        return false;
      }
    }

    let attempts = 0;
    const maxAttempts = 1000;

    while (attempts < maxAttempts) {
      const availableRoles = [...roles];
      const assignments = {};
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

      let success = true;

      for (let player of shuffledPlayers) {
        const possibleRoles = availableRoles.filter(role => 
          canPlayerTakeRole(player.id, role, assignments)
        );

        if (possibleRoles.length === 0) {
          success = false;
          break;
        }

        const randomIndex = Math.floor(Math.random() * possibleRoles.length);
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
  const resetNames = () => {
    localStorage.removeItem('playerNames');
    setPlayerNames(['', '', '', '', '']);
    setShowNameInput(true);
    setShowResults(false);
  };

  // Новая рандомизация
  const rerandomize = () => {
    randomizeRoles();
  };

  // Возврат к выбору ролей
  const backToRoleSelection = () => {
    setShowResults(false);
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
                  <label>Игрок {index + 1}:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
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
                <button onClick={backToRoleSelection} className="back-button">
                  Назад к выбору ролей
                </button>
                <button onClick={rerandomize} className="rerandomize-button">
                  Перемешать
                </button>
                
                <div className="results-grid">
                  {players.map(player => (
                    <div key={player.id} className="result-card">
                      <div className="player-name">{player.name}</div>
                      <div className={`assigned-role role-${assignedRoles[player.id]}`}>
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
}

export default App;