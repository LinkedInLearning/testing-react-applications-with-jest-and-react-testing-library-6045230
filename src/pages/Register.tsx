import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 28rem;
  margin: 2rem auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  padding: 2rem;
  text-align: center;
  color: white;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
`;

const Form = styled.form`
  padding: 2rem;
`;

const FormGroup = styled.div`
  position: relative;
`;

const FormGroupWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background-color: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LinkText = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;

  a {
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
    margin-left: 0.25rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const InputErrorMessage = styled.div`
  color: #dc2626;
  padding: 0.5rem;
  font-size: 0.875rem;
`;



export function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', email: '', password: '', formError: '' });
  const [loading, setLoading] = useState(false);

  const resetError = { username: '', email: '', password: '', formError: '' }

  const validate = () => {
    let newErrors = resetError;
    if (username.trim().length < 3) newErrors.username = 'Username must be at least 3 characters long';

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = 'Invalid email format';

    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters long';

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      setErrors(resetError);
      await signUp(email, password, username);
      navigate('/');
    } catch (error) {
      setErrors({
        ...errors,
        formError: 'Failed to create account'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Header>
          <Title data-testid="register-header">Create Account</Title>
          <Subtitle>Join our community today</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          {errors.formError && (
            <ErrorMessage>
              <UserPlus size={18} />
              {errors.formError}
            </ErrorMessage>
          )}
          <FormGroupWrapper>
            <FormGroup>

              <InputIcon>
                <User size={18} />
              </InputIcon>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

            </FormGroup>
            {errors.username && <InputErrorMessage>{errors.username}</InputErrorMessage>}
          </FormGroupWrapper>
          <FormGroupWrapper>
            <FormGroup>
              <InputIcon>
                <Mail size={18} />
              </InputIcon>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />


            </FormGroup>
            {errors.email && <InputErrorMessage>{errors.email}</InputErrorMessage>}
          </FormGroupWrapper>
          <FormGroupWrapper>
            <FormGroup>

              <InputIcon>
                <Lock size={18} />
              </InputIcon>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormGroup>
            {errors.password && <InputErrorMessage>{errors.password}</InputErrorMessage>}
          </FormGroupWrapper>

          <Button type="submit" disabled={loading} data-testid="create-account-btn">
            {loading ? (
              'Creating account...'
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </Button>

          <LinkText>
            Already have an account?
            <Link to="/login">Sign in</Link>
          </LinkText>
        </Form>
      </Card>
    </Container>
  );
}