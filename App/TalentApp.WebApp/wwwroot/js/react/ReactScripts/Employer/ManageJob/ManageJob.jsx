import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment, Card, Button, Label, Header, Container } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: ""
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);

    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        //this.setState({ loaderData });//comment this

        //set loaderData.isLoading to false after getting data
        this.loadData(() =>
            this.setState({ loaderData })
        )
    }

    componentDidMount() {
        this.init();
    };

    loadData(callback) {
        var link = 'https://talentservicestalent20190827015426.azurewebsites.net/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');
        var { filter } = this.state;

        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            data: {
                activePage: this.state.activePage,
                showActive: filter.showActive,
                showClosed: filter.showClosed,
                showDraft: filter.showDraft,
                showExpired: filter.showExpired,
                showUnexpired: filter.showUnexpired,
                sortbyDate: this.state.sortBy.date
            },
            success: function (res) {
                let loadJobs = null;
                if (res.myJobs.length > 0) {
                    loadJobs = res.myJobs
                }
                this.setState({ loadJobs })
                callback();
            }.bind(this),
            error: function (res) {
                console.log(res.status)
            }
        });
    }

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }

    render() {
        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <Header size='large'>List of Jobs</Header>

                    <Icon name="filter" />
                    <span>Filter: </span>
                    <Dropdown text='Choose Filter'>
                        <Dropdown.Menu>
                            <Dropdown.Item icon='folder' text='Active' />
                            <Dropdown.Item icon='ban' text='Closed' />
                            <Dropdown.Item icon='edit' text='Draft' />
                            <Dropdown.Item icon='time' text='Expired' />
                            <Dropdown.Item icon='newspaper outline' text='Unexpired' />
                        </Dropdown.Menu>
                    </Dropdown>

                    <Icon name="calendar" />
                    <span>Sort by date: </span>
                    <Dropdown text='Newest first'>
                        <Dropdown.Menu>
                            <Dropdown.Item text='Newest first' />
                            <Dropdown.Item text='Oldest first' />
                        </Dropdown.Menu>
                    </Dropdown>

                    {this.state.loadJobs ? this.renderJobSummaryCards() : <p>No Jobs Found</p>}

                    <div style={{ margin: 20, minHeight: 40 }}>
                        <Pagination defaultActivePage={1} totalPages={this.state.totalPages} floated="right" />
                    </div>
                </div>
            </BodyWrapper>
        )
    }

    renderJobSummaryCards() {
        return (
            <Card.Group itemsPerRow="3" stackable>
                {this.state.loadJobs.map((jobData, index) => <JobSummaryCard key={index} jobData={jobData} />)}
            </Card.Group>
        )
    }
}