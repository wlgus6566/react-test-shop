import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './style/RegisterPage.css';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5003/register', {
                username,
                password
            });

            // 회원가입 성공 시 로그인 페이지로 이동
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.message || '회원가입에 실패했습니다.');
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>회원가입</h2>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="username">아이디</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        회원가입
                    </button>
                </form>
                <div className="mt-3 text-center">
                    <p>이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
                </div>
            </div>
        </div>
    );
} 