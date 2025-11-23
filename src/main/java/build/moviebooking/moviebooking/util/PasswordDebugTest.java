package build.moviebooking.moviebooking.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordDebugTest {


    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

        // O hash que está no banco
        String hashFromDB = "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

        // Tente várias senhas possíveis
        String[] possiblePasswords = {
                "admin",
                "admin123",
                "Admin123",
                "password",
                "123456"
        };

        System.out.println("=== TESTANDO SENHAS ===\n");

        for (String pwd : possiblePasswords) {
            boolean matches = encoder.matches(pwd, hashFromDB);
            System.out.println("Senha: '" + pwd + "' -> " + (matches ? "✓ CORRETA" : "✗ Incorreta"));
        }

        System.out.println("\n=== GERANDO NOVA SENHA ===\n");
        String newPassword = "admin123";
        String newHash = encoder.encode(newPassword);
        System.out.println("Nova senha: " + newPassword);
        System.out.println("Novo hash: " + newHash);
        System.out.println("\nSQL para atualizar:");
        System.out.println("UPDATE users SET password = '" + newHash + "' WHERE username = 'admin';");
    }
}
