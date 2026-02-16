# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - tablist [ref=e4]:
      - tab "Login" [selected] [ref=e5]
      - tab "Criar conta" [ref=e6]
    - tabpanel "Login" [ref=e7]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: Login
          - generic [ref=e12]: Faça login para continuar.
        - generic [ref=e13]:
          - generic [ref=e14]:
            - generic [ref=e15]: E-mail
            - textbox "E-mail" [ref=e16]:
              - /placeholder: Digite seu e-mail
          - generic [ref=e17]:
            - generic [ref=e18]: Senha
            - textbox "Senha" [ref=e19]:
              - /placeholder: Digite sua senha
        - generic [ref=e21]:
          - button "Entrar" [ref=e22]
          - button "Entrar com Google" [ref=e23]:
            - img
            - text: Entrar com Google
  - region "Notifications alt+T"
  - alert [ref=e24]
  - button "Open Next.js Dev Tools" [ref=e30] [cursor=pointer]:
    - img [ref=e31]
```