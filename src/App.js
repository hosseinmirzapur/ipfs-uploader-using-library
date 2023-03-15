import {useState} from "react";
import * as IPFS from 'ipfs-core'
import {Container, Row, Col, Card, Form, Button, Spinner} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import Gun from 'gun'

const App = () => {
    // Variables
    const [ipfs, setIpfs] = useState(null)
    const [directory, setDirectory] = useState([])
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [loading, setLoading] = useState(false)
    const [gun, setGun] = useState(null)

    // Methods
    const initialize = async () => {
        setLoading(true)

        const node = await IPFS.create()
        setIpfs(node)

        const gun = Gun()
        setGun(gun)

        const files = gun.get('files')
        const fileArray = []
        await files.map().on(file => {
            fileArray.push({
                cid: file?.cid
            })
        })
        setUploadedFiles(fileArray)

        setLoading(false)
    }

    const addToGun = async (cid) => {
        const files = gun.get('files')
        const data = {cid: cid.toString()}
        files.set(data)
        await setUploadedFiles([...uploadedFiles, data])
    }

    const handleClearStorage = () => {
        localStorage.clear()
        setUploadedFiles([])
        gun.get('files').put(null)
    }

    const addFileToDirectory = async (file) => {
        setLoading(true)
        const addedFile = await ipfs.add(file)
        setDirectory([...directory, addedFile])
        setLoading(false)
    }

    const handleLinkClick = async (cid) => {
        setLoading(true)
        const a = document.createElement('a')
        a.href = 'https://ipfs.io/ipfs/' + cid
        a.target = '_blank'
        a.download = 'true'
        a.click()
        a.remove()
        setLoading(false)
    }

    return (
        <Container className="mt-4">
            {loading ? <div className={'d-flex flex-column justify-content-center text-center'}>
                <h3>Loading IPFS, please wait...</h3>
                <hr/>
                <div className={'text-center'}>
                    <Spinner animation={'border'} variant={'dark'}>
                        🔵
                    </Spinner>
                </div>
            </div> : <>
                <Row>
                    <Col>
                        <Card>
                            <Card.Body className={'d-flex flex-column gap-3'}>
                                {ipfs ? (
                                        <>
                                            <Form>
                                                <Form.Group controlId="formFile">
                                                    <Form.Label>
                                                        Select a file to add to IPFS
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="file"
                                                        onChange={e => addFileToDirectory(e.target.files[0])}
                                                    />
                                                </Form.Group>
                                            </Form>
                                        </>
                                    ) :
                                    <Button variant="primary" onClick={initialize}>
                                        Initialize IPFS
                                    </Button>
                                }
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <div className={'d-flex justify-content-center text-center'}>
                        <h3>{directory.length === 0 ? 'No files uploaded yet' : 'Files uploaded to IPFS:'}</h3>
                    </div>
                    {
                        directory.map(file => (
                            <Col md={4} key={`${file.cid.toString()}-stuff`}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{file.path}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">{file.cid.toString()}</Card.Subtitle>
                                        <Card.Footer className={'d-flex flex-row gap-2'}>
                                            <Button
                                                variant={'outline-success'}
                                                onClick={() => handleLinkClick(file.cid.toString())}
                                            >
                                                Show on IPFS
                                            </Button>
                                            <Button variant={'outline-danger'} onClick={handleClearStorage}>
                                                Clear Storage
                                            </Button>
                                            <Button
                                                variant={'outline-primary'}
                                                onClick={() => addToGun(file.cid.toString())}
                                            >
                                                Save File
                                            </Button>
                                        </Card.Footer>
                                        <Card.Text>{file.size} bytes</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    }
                </Row>

                <hr/>

                <Row className="mt-4">
                    <h3 className={'d-flex justify-content-center'}>
                        {uploadedFiles.length === 0 ? 'No saved files found' : 'Saved files so far:'}
                    </h3>
                    {
                        uploadedFiles.map((file, index) => (
                            <Col md={4} key={`uploaded-${index}`} className={'mb-3'}>
                                <Card>
                                    <Card.Body>
                                        <Card.Text className="mb-2 text-muted">{file?.cid?.toString()}</Card.Text>
                                        <Card.Footer className={'d-flex flex-row gap-2'}>
                                            <Button
                                                variant={'outline-success'}
                                                onClick={() => handleLinkClick(file?.cid?.toString())}
                                            >
                                                Show on IPFS
                                            </Button>
                                            <Button variant={'outline-danger'} onClick={handleClearStorage}>
                                                Clear Storage
                                            </Button>
                                        </Card.Footer>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    }
                </Row>
            </>}
        </Container>
    )
}

export default App
