<p align="center">
  <img src="./public/CatFinderLogo.png" width="500" alt="CatFinder Logo">
</p>

![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-5C2D91?style=for-the-badge&logo=dotnet&logoColor=white)
![Entity Framework](https://img.shields.io/badge/Entity_Framework_Core-68217A?style=for-the-badge&logo=.net&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Clean Architecture](https://img.shields.io/badge/Clean_Architecture-111827?style=for-the-badge)
![CQRS](https://img.shields.io/badge/CQRS-0F172A?style=for-the-badge)
![MediatR](https://img.shields.io/badge/MediatR-1E293B?style=for-the-badge)
![Repository Pattern](https://img.shields.io/badge/Repository_Pattern-334155?style=for-the-badge)
![AutoMapper](https://img.shields.io/badge/AutoMapper-E67E22?style=for-the-badge)

A full-stack lost & found cat platform built with ASP.NET Core, React, and SQL Server.
Users can create advertisements for missing or found cats, comment on listings, save advertisements, and manage their account securely using JWT authentication.

## Preview Screenshots
<p align="center">
  <img src="./public/imageOne.png" width="32%" alt="CatFinder Logo">
  <img src="./public/ImageTwo.png" width="32%" alt="CatFinder Logo">
  <img src="./public/ImageThree.png" width="32%" alt="CatFinder Logo">
</p>

## Why CatFinder Exists

<p>CatFinder was created to solve a common issue many pet owners face when searching for lost or found cats online.
Today, most missing-cat posts are scattered across Facebook groups, local forums, and outdated websites with inconsistent design and poor accessibility. We wanted to create a centralized platform where users can quickly create, browse, and interact with advertisements in a clean and user-friendly environment.
Our goal with CatFinder is to provide a modern, accessible, and community-driven platform dedicated entirely to helping reunite cats with their owners.</p>

## Architecture

CatFinder follows Clean Architecture principles combined with CQRS using MediatR.

The backend is structured into:
- API Layer
- Application Layer
- Domain Layer
- Infrastructure Layer

This separation improves:
- scalability
- maintainability
- testability
- separation of concerns

## Highlights

- JWT Authentication & Authorization
- Clean Architecture + CQRS
- Repository Pattern
- React Query data caching
- Zustand authentication persistence
- SQL Server + Entity Framework Core
- Role-based access support (RBAC)

## Deployment

CatFinder is currently under active development and is planned to be deployed to a cloud-hosted VPS environment using providers such as DigitalOcean.

Planned deployment features include:
- Reverse proxy with Nginx
- HTTPS with SSL certificates
- SQL Server hosting
- Environment-based configuration
- Production-ready API hosting

## Live Demo
Live deployment currently in progress.

## Special Thanks

CatFinder was built collaboratively as a team effort.  
Special thanks to everyone who contributed through development, debugging, testing, architecture discussions, and project collaboration:

- [@sacad725](https://github.com/Sacad725)
- [@geoch4](https://github.com/geoch4)
- [@marsimjob](https://github.com/marsimjob)
