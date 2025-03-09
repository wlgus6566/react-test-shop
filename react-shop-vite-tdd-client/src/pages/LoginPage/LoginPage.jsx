import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './style/LoginPage.css';
import { OrderContext } from '../../contexts/OrderContext';

export default function LoginPage({ setIsAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({
        username: '',
        password: ''
    });
    const navigate = useNavigate();
    const [, , , deductPoints, , setUserPoints] = useContext(OrderContext);

    const validateForm = () => {
        const errors = {
            username: '',
            password: ''
        };
        
        if (!username) {
            errors.username = '아이디를 입력해주세요.';
        }
        if (!password) {
            errors.password = '비밀번호를 입력해주세요.';
        }

        setValidationErrors(errors);
        return !errors.username && !errors.password;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await axios.post('http://localhost:5003/login', {
                username,
                password
            });

            // 토큰과 사용자 정보 저장
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // 인증 상태 업데이트
            setIsAuthenticated(true);

            // OrderContext에 포인트 설정
            setUserPoints(response.data.user.points);

            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || '로그인에 실패했습니다.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>로그인</h2>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form onSubmit={handleLogin} noValidate>
                    <div className="form-group">
                        <label htmlFor="username">아이디</label>
                        <input
                            type="text"
                            id="username"
                            className={`form-control ${validationErrors.username ? 'is-invalid' : ''}`}
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setValidationErrors(prev => ({...prev, username: ''}));
                            }}
                        />
                        {validationErrors.username && (
                            <div className="validation-error" data-testid="username-error">
                                {validationErrors.username}
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setValidationErrors(prev => ({...prev, password: ''}));
                            }}
                        />
                        {validationErrors.password && (
                            <div className="validation-error" data-testid="password-error">
                                {validationErrors.password}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        로그인
                    </button>
                </form>
                <div className="mt-3 text-center">
                    <p>계정이 없으신가요? <Link to="/register">회원가입</Link></p>
                </div>
            </div>
        </div>
    );
} 