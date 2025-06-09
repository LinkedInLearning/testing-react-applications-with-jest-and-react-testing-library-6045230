import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const Nav = styled.nav`
  background: white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
`;

const NavContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  text-decoration: none;

  &:hover {
    color: #4b5563;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: #4b5563;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`;

const SignOutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: #4b5563;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`;

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <Nav>
      <NavContainer>
        <NavContent>
          <Logo to="/">
            <BookOpen size={24} />
            <span>Annex Blog</span>
          </Logo>
          <NavLinks>
            {user ? (
              <>
                <NavLink to="/create">Create Post</NavLink>
                <SignOutButton onClick={signOut}>Sign Out</SignOutButton>
              </>
            ) : (
              <>
                <NavLink to="/login">
                  <LogIn size={18} />
                  <span>Sign In</span>
                </NavLink>
                <NavLink to="/register">
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </NavLink>
              </>
            )}
          </NavLinks>
        </NavContent>
      </NavContainer>
    </Nav>
  );
}