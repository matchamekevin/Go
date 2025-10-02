import pool from './src/shared/database/client';

async function checkSuspendedUsers() {
  try {
    console.log('Vérification des utilisateurs suspendus...');

    // Compter tous les utilisateurs
    const totalRes = await pool.query("SELECT COUNT(*)::int as total FROM users");
    console.log(`Total utilisateurs: ${totalRes.rows[0].total}`);

    // Compter les utilisateurs vérifiés
    const verifiedRes = await pool.query("SELECT COUNT(*)::int as verified FROM users WHERE is_verified = true");
    console.log(`Utilisateurs vérifiés: ${verifiedRes.rows[0].verified}`);

    // Compter les utilisateurs suspendus
    const suspendedRes = await pool.query("SELECT COUNT(*)::int as suspended FROM users WHERE COALESCE(is_suspended,false) = true");
    console.log(`Utilisateurs suspendus: ${suspendedRes.rows[0].suspended}`);

    // Lister les utilisateurs suspendus
    const suspendedUsers = await pool.query("SELECT id, email, name, is_suspended FROM users WHERE COALESCE(is_suspended,false) = true");
    console.log('Utilisateurs suspendus:');
    suspendedUsers.rows.forEach((user: any) => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Suspended: ${user.is_suspended}`);
    });

    // Lister quelques utilisateurs pour voir leur statut
    const allUsers = await pool.query("SELECT id, email, name, is_verified, COALESCE(is_suspended,false) as is_suspended FROM users LIMIT 10");
    console.log('\nÉchantillon d\'utilisateurs:');
    allUsers.rows.forEach((user: any) => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Verified: ${user.is_verified}, Suspended: ${user.is_suspended}`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    process.exit(0);
  }
}

checkSuspendedUsers();