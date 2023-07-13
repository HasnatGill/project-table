import Styles from '@/app/styles/navbar.module.css'
import Container from '@mui/material/Container'
import Avatar from '@mui/material/Avatar';

export default function navbar() {
  return (
    <>
      <Container fixed >
        <nav className={Styles.navbar}>

          <div>
            <h4>Hasnat Majid</h4>
          </div>

          <div className={Styles.right}>
            <h5>Feedback</h5>
            <h5>Support</h5>
            <Avatar className={Styles.Avatar_Navbar} >H</Avatar>
          </div>

        </nav>
      </Container>
      <hr/>
    </>
  )
}
