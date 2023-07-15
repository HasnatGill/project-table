"use client"

import { Space, Avatar, Typography } from "antd"
import styles from '@/app/page.module.css'

const { Title } = Typography;

export default function Navbar() {
    return (
        <>
            <nav className={styles.NAVBAR}>
                <div>
                    <Title level={3} style={{margin:'0px'}}>AAA</Title>
                </div>
                <Space size='large'>
                    <Title level={5} style={{margin:'0px'}}>Feedback</Title>
                    <Title level={5} style={{margin:'0px'}}>Support</Title>
                    <Avatar>A</Avatar>
                </Space>
            </nav>
        </>
    )
}
